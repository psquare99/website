// Phase 5.6 — D1 smoke test for Page content type
// Validates the full page lifecycle against real SQLite via wrangler d1 execute --local:
//   Create → Publish → Query → Modify → Query (revision unchanged) → Republish
//   → Query (updated) → Rename slug (redirect exists) → Unpublish → Gone
//
// Also verifies: page works alongside journal and project.
//
// Uses --file for all D1 commands to avoid shell-escaping issues.

import { execSync } from "node:child_process";
import { rmSync, mkdirSync, existsSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import os from "node:os";

const ROOT = process.cwd();
const DB_NAME = "CONTENT_DB";
const PERSIST_DIR = join(ROOT, ".wrangler-page-smoke");
const MIGRATION_1 = join(ROOT, "migrations", "0001_initial_schema.sql");
const MIGRATION_2 = join(ROOT, "migrations", "0002_add_page_content_type.sql");

let sqlCounter = 0;

function tmpSql(sql: string): string {
  const p = join(os.tmpdir(), `d1-page-smoke-${process.pid}-${sqlCounter++}.sql`);
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
console.log("=== D1 Page Content Type Smoke Test ===\n");

if (existsSync(PERSIST_DIR)) {
  rmSync(PERSIST_DIR, { recursive: true });
}
mkdirSync(PERSIST_DIR, { recursive: true });

console.log("Applying migrations...");
d1File(MIGRATION_1);
d1File(MIGRATION_2);
console.log("Migrations applied.\n");

const now = new Date().toISOString();

// ===========================================================
// Test 1: Create and publish a Page
// ===========================================================
console.log("Test 1: Create and publish a Page");
const pageId = `page-smoke-${Date.now()}`;
d1(`INSERT INTO documents (id, content_type, slug, title, status, metadata, blocks, created_at, updated_at) VALUES ('${pageId}', 'page', 'about', 'About', 'draft', '{"description":"About me"}', '[{"id":"b1","type":"paragraph","data":{"text":"Hello from D1 page"}}]', '${now}', '${now}');`);

// Verify: draft does NOT appear in public query
const draftCheck = q(`SELECT id FROM documents WHERE content_type = 'page' AND status IN ('published', 'modified');`);
assert.ok(!draftCheck.some((r: any) => r.id === pageId), "draft page must not appear publicly");

// Publish: create revision, update status
const pubTime = new Date().toISOString();
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-page-1', '${pageId}', 'about', 'About', '{"description":"About me"}', '[{"id":"b1","type":"paragraph","data":{"text":"Hello from D1 page"}}]', 'published', '${pubTime}');`);
d1(`UPDATE documents SET status = 'published', published_at = '${pubTime}', published_slug = 'about', updated_at = '${pubTime}' WHERE id = '${pageId}';`);

// Query: must appear in public query
const pubCheck = q(`SELECT id, published_slug FROM documents WHERE content_type = 'page' AND status IN ('published', 'modified');`);
assert.ok(pubCheck.some((r: any) => r.id === pageId), "published page must appear in public query");
assert.equal(pubCheck.find((r: any) => r.id === pageId).published_slug, "about");

// Query published revision
const pageRev = q(`SELECT title, metadata FROM document_revisions WHERE document_id = '${pageId}' AND label = 'published' ORDER BY created_at DESC LIMIT 1;`);
assert.equal(pageRev.length, 1);
assert.equal(pageRev[0].title, "About");
const pageMeta = JSON.parse(pageRev[0].metadata);
assert.equal(pageMeta.description, "About me");

console.log("  PASS\n");

// ===========================================================
// Test 2: Modify page — public content stays at published revision
// ===========================================================
console.log("Test 2: Modified-state guarantee — public reads from revision, not live doc");
const editTime = new Date().toISOString();
d1(`UPDATE documents SET title = 'ABOUT (edited — should not appear)', status = 'modified', updated_at = '${editTime}' WHERE id = '${pageId}';`);

// Live document has the edited title
const livePage = q(`SELECT title, status FROM documents WHERE id = '${pageId}';`)[0];
assert.equal(livePage.status, "modified");
assert.ok(livePage.title.includes("edited"), "live document must reflect edit");

// Public query still returns it (modified is included)
const pubAfterEdit = q(`SELECT id FROM documents WHERE content_type = 'page' AND status IN ('published', 'modified');`);
assert.ok(pubAfterEdit.some((r: any) => r.id === pageId), "modified page must still appear in public query");

// Latest published revision has the ORIGINAL title
const revAfterEdit = q(`SELECT title FROM document_revisions WHERE document_id = '${pageId}' AND label = 'published' ORDER BY created_at DESC LIMIT 1;`);
assert.equal(revAfterEdit[0].title, "About", "published revision must have original title, not edited title");

console.log("  PASS\n");

// ===========================================================
// Test 3: Republish — new revision, original published_at preserved
// ===========================================================
console.log("Test 3: Republish — new revision created, original published_at preserved");
const originalPublishedAt = q(`SELECT published_at FROM documents WHERE id = '${pageId}';`)[0].published_at;
const repubTime = new Date().toISOString();

d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-page-2', '${pageId}', 'about', 'About (republished)', '{"description":"Updated about"}', '[{"id":"b2","type":"paragraph","data":{"text":"Updated content"}}]', 'published', '${repubTime}');`);
d1(`UPDATE documents SET status = 'published', title = 'About (republished)', metadata = '{"description":"Updated about"}', updated_at = '${repubTime}' WHERE id = '${pageId}';`);

// published_at must be preserved
const afterRepub = q(`SELECT published_at FROM documents WHERE id = '${pageId}';`)[0];
assert.equal(afterRepub.published_at, originalPublishedAt, "published_at must be preserved on republish");

// Latest published revision is the republished one
const latestRev = q(`SELECT title, metadata FROM document_revisions WHERE document_id = '${pageId}' AND label = 'published' ORDER BY created_at DESC LIMIT 1;`);
assert.ok(latestRev[0].title.includes("republished"), "latest published revision must have republished title");

// Two published revisions exist (append-only)
const allPubRevs = q(`SELECT id FROM document_revisions WHERE document_id = '${pageId}' AND label = 'published' ORDER BY created_at ASC;`);
assert.equal(allPubRevs.length, 2, "must have two published revisions");

console.log("  PASS\n");

// ===========================================================
// Test 4: Slug rename — redirect record created, scoped to content_type = page
// ===========================================================
console.log("Test 4: Slug rename creates redirect scoped to content_type = page");
const renameTime = new Date().toISOString();
const oldSlug = "about";
const newSlug = "about-me";

// Simulate rename: update editorial slug, keep published_slug as oldSlug
d1(`UPDATE documents SET slug = '${newSlug}', updated_at = '${renameTime}' WHERE id = '${pageId}';`);

// Republish with new slug
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-page-3', '${pageId}', '${newSlug}', 'About Me', '{"description":"About me"}', '[{"id":"b3","type":"paragraph","data":{"text":"New content"}}]', 'published', '${renameTime}');`);
d1(`UPDATE documents SET status = 'published', published_slug = '${newSlug}', updated_at = '${renameTime}' WHERE id = '${pageId}';`);

// Create redirect
const redirId = `redir-page-${Date.now()}`;
d1(`INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at) VALUES ('${redirId}', '${pageId}', 'page', '${oldSlug}', '${newSlug}', '${renameTime}');`);

// Verify redirect exists and is scoped to content_type = page
const redirects = q(`SELECT content_type, old_slug, new_slug FROM redirects WHERE document_id = '${pageId}';`);
assert.equal(redirects.length, 1);
assert.equal(redirects[0].content_type, "page", "redirect must be scoped to content_type = page");
assert.equal(redirects[0].old_slug, oldSlug);
assert.equal(redirects[0].new_slug, newSlug);

// New slug must resolve
const newSlugCheck = q(`SELECT id FROM documents WHERE content_type = 'page' AND published_slug = '${newSlug}' AND status IN ('published', 'modified');`);
assert.ok(newSlugCheck.some((r: any) => r.id === pageId), "new slug must resolve");

// Old slug must NOT resolve as a document
const oldSlugCheck = q(`SELECT id FROM documents WHERE content_type = 'page' AND published_slug = '${oldSlug}' AND status IN ('published', 'modified');`);
assert.ok(!oldSlugCheck.some((r: any) => r.id === pageId), "old slug must not resolve after rename");

console.log("  PASS\n");

// ===========================================================
// Test 5: Unpublish — page removed from public, publishedSlug cleared
// ===========================================================
console.log("Test 5: Unpublish — page gone from public, slug cleared");
d1(`UPDATE documents SET status = 'unpublished', published_slug = NULL, updated_at = '${new Date().toISOString()}' WHERE id = '${pageId}';`);

const pubAfterUnpub = q(`SELECT id FROM documents WHERE content_type = 'page' AND status IN ('published', 'modified');`);
assert.ok(!pubAfterUnpub.some((r: any) => r.id === pageId), "unpublished page must not appear publicly");

const slugAfterUnpub = q(`SELECT id FROM documents WHERE content_type = 'page' AND published_slug = '${newSlug}';`);
assert.equal(slugAfterUnpub.length, 0, "slug must not resolve after unpublish");

// Verify published_at is preserved (historical)
const unpubDoc = q(`SELECT published_at, slug, status FROM documents WHERE id = '${pageId}';`)[0];
assert.ok(unpubDoc.published_at !== null, "published_at must be preserved (history)");
assert.equal(unpubDoc.slug, newSlug, "editorial slug must be preserved");
assert.equal(unpubDoc.status, "unpublished");

console.log("  PASS\n");

// ===========================================================
// Test 6: Page alongside journal and project — IN clause scoped correctly
// ===========================================================
console.log("Test 6: Page alongside journal and project — IN clause scoped correctly");
const journalId = `j-smoke-${Date.now()}`;
const projId = `p-smoke-${Date.now()}`;
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${journalId}', 'journal', 'smoke-journal', 'Smoke Journal', 'published', '${now}', 'smoke-journal', '{}', '[]', '${now}', '${now}');`);
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-j', '${journalId}', 'smoke-journal', 'Smoke Journal', '{}', '[]', 'published', '${now}');`);
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${projId}', 'project', 'smoke-proj', 'Smoke Project', 'published', '${now}', 'smoke-proj', '{}', '[]', '${now}', '${now}');`);
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-p', '${projId}', 'smoke-proj', 'Smoke Project', '{}', '[]', 'published', '${now}');`);

// Create a new live page for this test
const livePageId = `page-live-${Date.now()}`;
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${livePageId}', 'page', 'smoke-live', 'Smoke Live Page', 'published', '${now}', 'smoke-live', '{}', '[]', '${now}', '${now}');`);
d1(`INSERT INTO document_revisions (id, document_id, slug, title, metadata, blocks, label, created_at) VALUES ('rev-live', '${livePageId}', 'smoke-live', 'Smoke Live Page', '{}', '[]', 'published', '${now}');`);

const journals = q(`SELECT id FROM documents WHERE content_type = 'journal' AND status IN ('published', 'modified');`);
const projects = q(`SELECT id FROM documents WHERE content_type = 'project' AND status IN ('published', 'modified');`);
const pages = q(`SELECT id FROM documents WHERE content_type = 'page' AND status IN ('published', 'modified');`);

assert.ok(journals.some((r: any) => r.id === journalId), "journal must appear in journal query");
assert.ok(!journals.some((r: any) => r.id === projId), "project must NOT appear in journal query");
assert.ok(!journals.some((r: any) => r.id === livePageId), "page must NOT appear in journal query");

assert.ok(projects.some((r: any) => r.id === projId), "project must appear in project query");
assert.ok(!projects.some((r: any) => r.id === journalId), "journal must NOT appear in project query");
assert.ok(!projects.some((r: any) => r.id === livePageId), "page must NOT appear in project query");

assert.ok(pages.some((r: any) => r.id === livePageId), "page must appear in page query");
assert.ok(!pages.some((r: any) => r.id === journalId), "journal must NOT appear in page query");
assert.ok(!pages.some((r: any) => r.id === projId), "project must NOT appear in page query");

console.log("  PASS\n");

// ===========================================================
// Test 7: Empty state — zero published pages returns empty
// ===========================================================
console.log("Test 7: Empty state — zero published pages returns empty");
d1(`DELETE FROM documents WHERE content_type = 'page';`);

const emptyPages = q(`SELECT id FROM documents WHERE content_type = 'page' AND status IN ('published', 'modified');`);
assert.equal(emptyPages.length, 0, "empty must return zero rows for page");

// Journal/Project unaffected
const journalsAfter = q(`SELECT id FROM documents WHERE content_type = 'journal' AND status IN ('published', 'modified');`);
const projectsAfter = q(`SELECT id FROM documents WHERE content_type = 'project' AND status IN ('published', 'modified');`);
assert.ok(journalsAfter.length > 0, "journal must still exist");
assert.ok(projectsAfter.length > 0, "project must still exist");

console.log("  PASS\n");

// ===========================================================
// Test 8: Cross-content-type slug conflict — page slug different from journal/project
// ===========================================================
console.log("Test 8: Cross-content-type redirect uniqueness — page redirect scoped to page");
const ctTime = new Date().toISOString();
const sharedSlug = "shared-slug";

// Re-insert the page document deleted in test 7 (FK requires existing document)
d1(`INSERT INTO documents (id, content_type, slug, title, status, published_at, published_slug, metadata, blocks, created_at, updated_at) VALUES ('${livePageId}', 'page', 'smoke-live', 'Smoke Live Page', 'published', '${now}', 'smoke-live', '{}', '[]', '${now}', '${now}');`);

// Create a journal redirect for shared-slug
d1(`INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at) VALUES ('redir-j-${Date.now()}', '${journalId}', 'journal', '${sharedSlug}', 'journal-new', '${ctTime}');`);

// Creating a PAGE redirect for the SAME slug should succeed (different content_type)
d1(`INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at) VALUES ('redir-p-${Date.now()}', '${livePageId}', 'page', '${sharedSlug}', 'page-new', '${ctTime}');`);

const allRedirects = q(`SELECT content_type, old_slug FROM redirects WHERE old_slug = '${sharedSlug}';`);
assert.equal(allRedirects.length, 2, "both journal and page redirects must coexist");
assert.ok(allRedirects.some((r: any) => r.content_type === "journal"), "journal redirect exists");
assert.ok(allRedirects.some((r: any) => r.content_type === "page"), "page redirect exists");

console.log("  PASS\n");

// --- Cleanup ---
rmSync(PERSIST_DIR, { recursive: true });

console.log("=== All 8 page D1 smoke tests passed ===");
