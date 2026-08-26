// Phase 3.7 — Real local D1 smoke test
// Runs against actual SQLite via wrangler d1 execute --local
// to confirm MockD1 and real D1 agree on critical behaviors.

import { execSync } from "node:child_process";
import { rmSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const ROOT = process.cwd();
const DB_NAME = "CONTENT_DB";
const PERSIST_DIR = join(ROOT, ".wrangler-smoke");
const SQL_FILE = join(ROOT, "migrations", "0001_initial_schema.sql");

function d1(sql: string): any {
  const escaped = sql.replace(/"/g, '\\"');
  try {
    const result = execSync(
      `npx wrangler d1 execute ${DB_NAME} --local --command "${escaped}" --json --persist-to "${PERSIST_DIR}"`,
      { encoding: "utf-8", cwd: ROOT }
    );
    return JSON.parse(result);
  } catch (err: any) {
    const stdout = err.stdout ?? "";
    const stderr = err.stderr ?? "";
    // If stdout contains JSON with an error, throw a readable error
    try {
      const parsed = JSON.parse(stdout);
      if (parsed?.error?.text) {
        throw new Error(parsed.error.text);
      }
    } catch (innerErr: any) {
      if (innerErr.message && !innerErr.message.includes("JSON")) {
        throw innerErr;
      }
    }
    throw new Error(`wrangler d1 failed: ${stderr || stdout || err.message}`);
  }
}

function d1File(file: string): void {
  execSync(
    `npx wrangler d1 execute ${DB_NAME} --local --file "${file}" --persist-to "${PERSIST_DIR}"`,
    { encoding: "utf-8", cwd: ROOT }
  );
}

function rows(result: any): any[] {
  const entry = Array.isArray(result) ? result[0] : result;
  return entry?.results ?? entry?.response?.results ?? [];
}

function q(sql: string): any[] {
  return rows(d1(sql));
}

// --- Setup ---
console.log("=== D1 Smoke Test ===\n");

if (existsSync(PERSIST_DIR)) {
  rmSync(PERSIST_DIR, { recursive: true });
}
mkdirSync(PERSIST_DIR, { recursive: true });

console.log("Applying migration...");
d1File(SQL_FILE);
console.log("Migration applied.\n");

const now = new Date().toISOString();

// ===========================================================
// Test 1: Create and first-publish a document
// ===========================================================
console.log("Test 1: Create and first-publish a document");
const docId = `doc-smoke-${Date.now()}`;
d1(
  `INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${docId}', 'journal', 'smoke-test', 'Smoke Test', 'published', '${now}', 'smoke-test', '{}', '[]', '${now}', '${now}')`
);
d1(
  `INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-1', '${docId}', 'smoke-test', 'Smoke Test', '{}', '[]', 'published', '${now}')`
);

const doc1 = q(`SELECT * FROM documents WHERE id = '${docId}'`)[0];
assert.ok(doc1, "document must exist");
assert.equal(doc1.status, "published");
assert.equal(doc1.published_slug, "smoke-test");
assert.ok(doc1.published_at, "published_at must be set");

const revs1 = q(`SELECT * FROM document_revisions WHERE document_id = '${docId}'`);
assert.equal(revs1.length, 1, "one revision must exist");
assert.equal(revs1[0].label, "published");
console.log("  PASS\n");

// ===========================================================
// Test 2: Republish with slug change — redirect created, published_at unchanged
// ===========================================================
console.log("Test 2: Republish with slug change — redirect + published_at preserved");
const originalPublishedAt = doc1.published_at;

d1(`UPDATE documents SET slug = 'smoke-new', published_slug = 'smoke-new', status = 'published', updated_at = '${now}' WHERE id = '${docId}'`);
d1(
  `INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at) VALUES ('redir-1', '${docId}', 'journal', 'smoke-test', 'smoke-new', '${now}')`
);

const doc2 = q(`SELECT * FROM documents WHERE id = '${docId}'`)[0];
assert.equal(doc2.published_at, originalPublishedAt, "published_at must NOT change");
assert.equal(doc2.published_slug, "smoke-new", "published_slug must update");

const redirs2 = q(`SELECT * FROM redirects WHERE document_id = '${docId}'`);
assert.equal(redirs2.length, 1, "redirect must exist");
assert.equal(redirs2[0].old_slug, "smoke-test");
assert.equal(redirs2[0].new_slug, "smoke-new");
assert.equal(redirs2[0].content_type, "journal");
console.log("  PASS\n");

// ===========================================================
// Test 3: Same-content-type slug conflict — constraint violation
// ===========================================================
console.log("Test 3: Same-content-type slug conflict — constraint violation");
const docId2 = `doc-smoke-conflict-${Date.now()}`;
d1(
  `INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${docId2}', 'journal', 'conflict-slug', 'Conflict Doc', 'published', '${now}', 'conflict-slug', '{}', '[]', '${now}', '${now}')`
);

let threw3 = false;
try {
  d1(
    `INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at) VALUES ('redir-conflict', '${docId2}', 'journal', 'smoke-test', 'something-else', '${now}')`
  );
} catch (e: any) {
  threw3 = true;
  assert.ok(
    e.message.includes("UNIQUE constraint failed"),
    `error must be unique constraint violation: ${e.message}`
  );
  assert.ok(
    e.message.includes("redirects"),
    `error must reference redirects table: ${e.message}`
  );
}
assert.ok(threw3, "same-content-type duplicate old_slug must throw");
console.log("  PASS\n");

// ===========================================================
// Test 4: Cross-content-type same slug — must succeed
// ===========================================================
console.log("Test 4: Cross-content-type same slug — must succeed");
d1(
  `INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at) VALUES ('redir-cross', '${docId2}', 'project', 'smoke-test', 'project-target', '${now}')`
);

const crossRows = q(`SELECT * FROM redirects WHERE old_slug = 'smoke-test'`);
assert.equal(crossRows.length, 2, "both journal and project redirects with same old_slug");
const types = crossRows.map((r: any) => r.content_type).sort();
assert.deepEqual(types, ["journal", "project"], "must have both content types");
console.log("  PASS\n");

// ===========================================================
// Test 5: Cascade delete — revisions + redirects removed
// ===========================================================
console.log("Test 5: Cascade delete — revisions + redirects removed");
const delId = `doc-smoke-del-${Date.now()}`;
d1(
  `INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${delId}', 'journal', 'delete-me', 'Delete Me', 'draft', NULL, NULL, '{}', '[]', '${now}', '${now}')`
);
d1(
  `INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-del', '${delId}', 'delete-me', 'Delete Me', '{}', '[]', 'draft', '${now}')`
);
d1(
  `INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at) VALUES ('redir-del', '${delId}', 'journal', 'delete-me-old', 'delete-me', '${now}')`
);

// Verify children exist
assert.equal(q(`SELECT * FROM document_revisions WHERE document_id = '${delId}'`).length, 1, "revision exists before delete");
assert.equal(q(`SELECT * FROM redirects WHERE document_id = '${delId}'`).length, 1, "redirect exists before delete");

// Delete
d1(`DELETE FROM documents WHERE id = '${delId}'`);

// Verify cascade
assert.equal(q(`SELECT * FROM documents WHERE id = '${delId}'`).length, 0, "document gone");
assert.equal(q(`SELECT * FROM document_revisions WHERE document_id = '${delId}'`).length, 0, "revision cascade-deleted");
assert.equal(q(`SELECT * FROM redirects WHERE document_id = '${delId}'`).length, 0, "redirect cascade-deleted");
console.log("  PASS\n");

// ===========================================================
// Test 5b: Cascade delete does NOT affect other documents
// ===========================================================
console.log("Test 5b: Cascade delete does NOT affect other documents");
const keepId = `doc-smoke-keep-${Date.now()}`;
d1(
  `INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${keepId}', 'journal', 'keep-me', 'Keep Me', 'draft', NULL, NULL, '{}', '[]', '${now}', '${now}')`
);
d1(
  `INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-keep', '${keepId}', 'keep-me', 'Keep Me', '{}', '[]', 'draft', '${now}')`
);

const delId2 = `doc-smoke-del2-${Date.now()}`;
d1(
  `INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${delId2}', 'journal', 'delete-me-2', 'Delete Me 2', 'draft', NULL, NULL, '{}', '[]', '${now}', '${now}')`
);
d1(
  `INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-del2', '${delId2}', 'delete-me-2', 'Delete Me 2', '{}', '[]', 'draft', '${now}')`
);
d1(`DELETE FROM documents WHERE id = '${delId2}'`);

assert.equal(q(`SELECT * FROM document_revisions WHERE document_id = '${keepId}'`).length, 1, "unrelated revision survives");
console.log("  PASS\n");

// --- Cleanup ---
rmSync(PERSIST_DIR, { recursive: true });

console.log("=== All 6 smoke tests passed ===");
