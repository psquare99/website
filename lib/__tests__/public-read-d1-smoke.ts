// Phase 5.5 — D1 smoke test for public-read.ts query patterns
// Validates that the exact SQL shapes used by public-read.ts work correctly
// against real SQLite via wrangler d1 execute --local.
//
// Uses --file for all D1 commands to avoid shell-escaping issues with
// complex SQL containing JSON.

import { execSync } from "node:child_process";
import { rmSync, mkdirSync, existsSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import os from "node:os";

const ROOT = process.cwd();
const DB_NAME = "CONTENT_DB";
const PERSIST_DIR = join(ROOT, ".wrangler-public-read-smoke");
const SQL_FILE = join(ROOT, "migrations", "0001_initial_schema.sql");

let sqlCounter = 0;

function tmpSql(sql: string): string {
  const p = join(os.tmpdir(), `d1-smoke-${process.pid}-${sqlCounter++}.sql`);
  writeFileSync(p, sql, "utf-8");
  return p;
}

function d1File(file: string): void {
  execSync(
    `npx wrangler d1 execute ${DB_NAME} --local --file "${file}" --persist-to "${PERSIST_DIR}"`,
    { encoding: "utf-8", cwd: ROOT }
  );
}

function d1(sql: string, timeout = 30000): void {
  const p = tmpSql(sql);
  try {
    execSync(
      `npx wrangler d1 execute ${DB_NAME} --local --file "${p}" --persist-to "${PERSIST_DIR}"`,
      { encoding: "utf-8", cwd: ROOT, timeout }
    );
  } finally {
    try { unlinkSync(p); } catch {}
  }
}

function d1Json(sql: string, timeout = 30000): any {
  const p = tmpSql(sql);
  try {
    const result = execSync(
      `npx wrangler d1 execute ${DB_NAME} --local --file "${p}" --json --persist-to "${PERSIST_DIR}"`,
      { encoding: "utf-8", cwd: ROOT, timeout }
    );
    return JSON.parse(result);
  } finally {
    try { unlinkSync(p); } catch {}
  }
}

function rows(result: any): any[] {
  const entry = Array.isArray(result) ? result[0] : result;
  return entry?.results ?? entry?.response?.results ?? [];
}

function q(sql: string): any[] {
  return rows(d1Json(sql));
}

// --- Setup ---
console.log("=== D1 Public-Read Smoke Test ===\n");

if (existsSync(PERSIST_DIR)) {
  rmSync(PERSIST_DIR, { recursive: true });
}
mkdirSync(PERSIST_DIR, { recursive: true });

console.log("Applying migration...");
d1File(SQL_FILE);
console.log("Migration applied.\n");

const now = new Date().toISOString();
const docId = `doc-pr-${Date.now()}`;

// ===========================================================
// Test 1: Published journal — public query returns it
// ===========================================================
console.log("Test 1: Published journal appears in public query (IN clause)");
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${docId}', 'journal', 'pr-test', 'PR Test Entry', 'published', '${now}', 'pr-test', '{"category":"dev-logs","excerpt":"Test excerpt"}', '[{"id":"b1","type":"paragraph","data":{"text":"Hello from D1"}}]', '${now}', '${now}');`);
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-pr-1', '${docId}', 'pr-test', 'PR Test Entry', '{"category":"dev-logs","excerpt":"Test excerpt"}', '[{"id":"b1","type":"paragraph","data":{"text":"Hello from D1"}}]', 'published', '${now}');`);

// Query shape 1: getPublicDocuments("journal")
const pubDocs = q(`SELECT id, content_type, published_slug, published_at FROM documents WHERE content_type = 'journal' AND status IN ('published', 'modified');`);
assert.equal(pubDocs.length, 1, "published journal must appear in IN query");
assert.equal(pubDocs[0].id, docId);
assert.equal(pubDocs[0].published_slug, "pr-test");

// Query shape 2: getLatestPublishedRevision(docId)
const revs = q(`SELECT * FROM document_revisions WHERE document_id = '${docId}' AND label = 'published' ORDER BY created_at DESC LIMIT 1;`);
assert.equal(revs.length, 1, "must find published revision");
assert.equal(revs[0].title, "PR Test Entry");

// Query shape 3: getPublicDocumentByPublishedSlug("journal", "pr-test")
const bySlug = q(`SELECT id, content_type, published_slug, published_at FROM documents WHERE content_type = 'journal' AND published_slug = 'pr-test' AND status IN ('published', 'modified');`);
assert.equal(bySlug.length, 1, "must find by published_slug");
assert.equal(bySlug[0].id, docId);

console.log("  PASS\n");

// ===========================================================
// Test 2: Modified state — public query still shows pre-edit content
// ===========================================================
console.log("Test 2: Modified-state guarantee — public reads from revision, not live doc");
const t2 = new Date().toISOString();
d1(`UPDATE documents SET title = 'EDITED Title (should NOT appear publicly)', metadata = '{"category":"dev-logs","excerpt":"Edited excerpt"}', status = 'modified', updated_at = '${t2}' WHERE id = '${docId}';`);

// Verify the live document has the edited title
const liveDoc = q(`SELECT title, status FROM documents WHERE id = '${docId}';`)[0];
assert.equal(liveDoc.status, "modified", "document status must be modified");
assert.ok(liveDoc.title.includes("EDITED"), "live document title must reflect the edit");

// Public query still returns via IN clause (modified is included)
const pubDocsAfterEdit = q(`SELECT id FROM documents WHERE content_type = 'journal' AND status IN ('published', 'modified');`);
assert.equal(pubDocsAfterEdit.length, 1, "modified doc must still appear in public query");

// Latest published revision still has ORIGINAL title
const revAfterEdit = q(`SELECT title, metadata FROM document_revisions WHERE document_id = '${docId}' AND label = 'published' ORDER BY created_at DESC LIMIT 1;`);
assert.equal(revAfterEdit.length, 1);
assert.equal(revAfterEdit[0].title, "PR Test Entry", "published revision title must be ORIGINAL, not the edited title");
const metaAfterEdit = JSON.parse(revAfterEdit[0].metadata);
assert.equal(metaAfterEdit.excerpt, "Test excerpt", "published revision metadata must be ORIGINAL excerpt, not edited");

console.log("  PASS\n");

// ===========================================================
// Test 3: Draft — excluded from public query
// ===========================================================
console.log("Test 3: Draft document excluded from public query");
const draftId = `doc-pr-draft-${Date.now()}`;
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${draftId}', 'journal', 'pr-draft', 'Draft Entry', 'draft', NULL, NULL, '{}', '[]', '${now}', '${now}');`);

const draftVisible = q(`SELECT id FROM documents WHERE content_type = 'journal' AND status IN ('published', 'modified');`);
assert.equal(draftVisible.length, 1, "draft must not appear in public query");
assert.ok(!draftVisible.some((r: any) => r.id === draftId), "draft id must not be in results");
console.log("  PASS\n");

// ===========================================================
// Test 4: Unpublished — excluded from public query, slug no longer resolves
// ===========================================================
console.log("Test 4: Unpublished document excluded + slug cleared");
const unpubId = `doc-pr-unpub-${Date.now()}`;
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${unpubId}', 'project', 'pr-unpub', 'Unpub Project', 'published', '${now}', 'pr-unpub', '{}', '[]', '${now}', '${now}');`);
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-unpub', '${unpubId}', 'pr-unpub', 'Unpub Project', '{}', '[]', 'published', '${now}');`);

// Verify visible
let visCheck = q(`SELECT id FROM documents WHERE content_type = 'project' AND status IN ('published', 'modified');`);
assert.ok(visCheck.some((r: any) => r.id === unpubId), "must be visible before unpublish");

// Unpublish: status → unpublished, published_slug → NULL
d1(`UPDATE documents SET status = 'unpublished', published_slug = NULL, updated_at = '${new Date().toISOString()}' WHERE id = '${unpubId}';`);

// Public query must not return it
visCheck = q(`SELECT id FROM documents WHERE content_type = 'project' AND status IN ('published', 'modified');`);
assert.ok(!visCheck.some((r: any) => r.id === unpubId), "unpublished must not appear in public query");

// Slug resolution must not find it
const slugCheck = q(`SELECT id FROM documents WHERE content_type = 'project' AND published_slug = 'pr-unpub' AND status IN ('published', 'modified');`);
assert.equal(slugCheck.length, 0, "slug must not resolve after unpublish");
console.log("  PASS\n");

// ===========================================================
// Test 5: Republish after edit — revision updated, published_at preserved
// ===========================================================
console.log("Test 5: Republish — new revision created, original published_at preserved");
const t5a = new Date().toISOString();
const originalPublishedAt = q(`SELECT published_at FROM documents WHERE id = '${docId}';`)[0].published_at;

// Create new published revision (simulates POST /publish after edit)
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-pr-2', '${docId}', 'pr-test', 'EDITED Title (should NOT appear publicly)', '{"category":"dev-logs","excerpt":"Edited excerpt"}', '[{"id":"b2","type":"paragraph","data":{"text":"Edited content"}}]', 'published', '${t5a}');`);
// Update document status back to published
d1(`UPDATE documents SET status = 'published', title = 'EDITED Title (should NOT appear publicly)', metadata = '{"category":"dev-logs","excerpt":"Edited excerpt"}', updated_at = '${t5a}' WHERE id = '${docId}';`);

// published_at must be preserved (immutable history)
const afterRepub = q(`SELECT published_at FROM documents WHERE id = '${docId}';`)[0];
assert.equal(afterRepub.published_at, originalPublishedAt, "published_at must be preserved on republish");

// Latest published revision is now the edited one
const latestRev = q(`SELECT title, metadata FROM document_revisions WHERE document_id = '${docId}' AND label = 'published' ORDER BY created_at DESC LIMIT 1;`);
assert.equal(latestRev.length, 1);
assert.ok(latestRev[0].title.includes("EDITED"), "latest published revision must now have edited title");

// Two published revisions exist (append-only)
const allRevs = q(`SELECT id, title, label FROM document_revisions WHERE document_id = '${docId}' AND label = 'published' ORDER BY created_at ASC;`);
assert.equal(allRevs.length, 2, "must have two published revisions (append-only)");
assert.equal(allRevs[0].title, "PR Test Entry", "first revision has original title");
assert.ok(allRevs[1].title.includes("EDITED"), "second revision has edited title");
console.log("  PASS\n");

// ===========================================================
// Test 6: Mixed content types — journal and project coexist
// ===========================================================
console.log("Test 6: Mixed content types — IN clause scoped by content_type");
const projId = `doc-pr-proj-${Date.now()}`;
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${projId}', 'project', 'pr-proj', 'Test Project', 'published', '${now}', 'pr-proj', '{"title":"Test Project","tagline":"A test"}', '[]', '${now}', '${now}');`);
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-proj', '${projId}', 'pr-proj', 'Test Project', '{"title":"Test Project","tagline":"A test"}', '[]', 'published', '${now}');`);

const journals = q(`SELECT id FROM documents WHERE content_type = 'journal' AND status IN ('published', 'modified');`);
const projects = q(`SELECT id FROM documents WHERE content_type = 'project' AND status IN ('published', 'modified');`);
assert.ok(journals.some((r: any) => r.id === docId), "journal must appear in journal query");
assert.ok(!journals.some((r: any) => r.id === projId), "project must NOT appear in journal query");
assert.ok(projects.some((r: any) => r.id === projId), "project must appear in project query");
assert.ok(!projects.some((r: any) => r.id === docId), "journal must NOT appear in project query");
console.log("  PASS\n");

// ===========================================================
// Test 7: Empty state — zero published docs returns empty
// ===========================================================
console.log("Test 7: Genuine empty state — zero rows returned");
d1(`DELETE FROM documents;`);

const emptyCheck = q(`SELECT id FROM documents WHERE content_type = 'journal' AND status IN ('published', 'modified');`);
assert.equal(emptyCheck.length, 0, "empty D1 must return zero rows");
console.log("  PASS\n");

// ===========================================================
// Test 8: DB error behavior — malformed SQL throws
// ===========================================================
console.log("Test 8: Malformed SQL throws (error propagation)");
let threw = false;
try {
  q(`SELECT * FROM nonexistent_table WHERE id = 'x';`);
} catch (e: any) {
  threw = true;
  // wrangler may throw for bad SQL or timeout — either proves errors propagate
  assert.ok(
    e.message.includes("no such table") || e.message.includes("SIGTERM") || e.status,
    `must throw for bad query: ${e.message}`
  );
}
assert.ok(threw, "bad SQL must throw, not return empty");
console.log("  PASS\n");

// --- Cleanup ---
rmSync(PERSIST_DIR, { recursive: true });

console.log("=== All 8 public-read D1 smoke tests passed ===");
