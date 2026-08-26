// Phase 12 — About page D1 smoke test
// Validates the about_page table against real SQLite via wrangler d1 execute --local:
//   Table creation → Upsert (insert) → Read → Upsert (update) → Read → Empty state → Read
//
// Uses --file for all D1 commands to avoid shell-escaping issues.

import { execSync } from "node:child_process";
import { rmSync, mkdirSync, existsSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import os from "node:os";

const ROOT = process.cwd();
const DB_NAME = "CONTENT_DB";
const PERSIST_DIR = join(ROOT, ".wrangler-about-smoke");
const MIGRATION_COMBINED = join(ROOT, "migrations", "0003_combined_final_schema.sql");
const MIGRATION_ABOUT = join(ROOT, "migrations", "0004_about_page.sql");

let sqlCounter = 0;

function tmpSql(sql: string): string {
  const p = join(os.tmpdir(), `d1-about-smoke-${process.pid}-${sqlCounter++}.sql`);
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
console.log("=== About Page D1 Smoke Test ===\n");

if (existsSync(PERSIST_DIR)) {
  rmSync(PERSIST_DIR, { recursive: true });
}
mkdirSync(PERSIST_DIR, { recursive: true });

console.log("Applying migrations...");
d1File(MIGRATION_COMBINED);
d1File(MIGRATION_ABOUT);
console.log("Migrations applied.\n");

const ABOUT_ID = "about";

// ===========================================================
// Test 1: about_page table exists and is empty
// ===========================================================
console.log("Test 1: about_page table exists and is empty");
const rows1 = q(`SELECT * FROM about_page`);
assert.equal(rows1.length, 0, "table starts empty");
console.log("  PASS\n");

// ===========================================================
// Test 2: Upsert inserts a new about_page row
// ===========================================================
console.log("Test 2: Upsert inserts a new about_page row");
const content1 = JSON.stringify({
  intro: {
    eyebrow: "ABOUT",
    heading: "A little about me.",
    text: "Hello world.",
    signature: "Prateek",
    image: "",
    imageAlt: "",
  },
  making: { heading: "", text: "", image: "", imageAlt: "", linkLabel: "", linkUrl: "" },
  mountains: { heading: "", text: "", location: "", image: "", imageAlt: "" },
  reading: { heading: "", text: "", bookTitle: "", bookAuthor: "", bookCover: "", bookCoverAlt: "" },
  now: [
    { icon: "Laptop", label: "Building", value: "Something" },
  ],
  closing: { eyebrow: "", heading: "", text: "", signature: "" },
});

d1(
  `INSERT INTO about_page (id, content, updated_at) VALUES ('${ABOUT_ID}', '${content1.replace(/'/g, "''")}', datetime('now'))
   ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`
);

const rows2 = q(`SELECT * FROM about_page WHERE id = '${ABOUT_ID}'`);
assert.equal(rows2.length, 1, "row exists after insert");
const parsed2 = JSON.parse(rows2[0].content);
assert.equal(parsed2.intro.eyebrow, "ABOUT", "eyebrow persisted");
assert.equal(parsed2.intro.heading, "A little about me.", "heading persisted");
assert.equal(parsed2.intro.text, "Hello world.", "text persisted");
assert.equal(parsed2.intro.signature, "Prateek", "signature persisted");
assert.equal(parsed2.now.length, 1, "now items persisted");
assert.equal(parsed2.now[0].icon, "Laptop", "now item icon persisted");
assert.equal(parsed2.now[0].label, "Building", "now item label persisted");
assert.equal(parsed2.now[0].value, "Something", "now item value persisted");
console.log("  PASS\n");

// ===========================================================
// Test 3: Upsert overwrites existing row (update path)
// ===========================================================
console.log("Test 3: Upsert overwrites existing row (update path)");
const content2 = JSON.stringify({
  intro: {
    eyebrow: "HELLO",
    heading: "Updated heading.",
    text: "Updated text.",
    signature: "P²",
    image: "https://example.com/portrait.jpg",
    imageAlt: "Portrait",
  },
  making: { heading: "Making", text: "Things", image: "", imageAlt: "", linkLabel: "", linkUrl: "" },
  mountains: { heading: "Mountains", text: "High", location: "Kumaon", image: "", imageAlt: "" },
  reading: { heading: "Reading", text: "Books", bookTitle: "Sapiens", bookAuthor: "Harari", bookCover: "", bookCoverAlt: "" },
  now: [
    { icon: "Laptop", label: "Building", value: "Prime" },
    { icon: "MapPin", label: "Exploring", value: "Dharchula" },
  ],
  closing: { eyebrow: "END", heading: "Bye.", text: "Thanks.", signature: "P" },
});

d1(
  `INSERT INTO about_page (id, content, updated_at) VALUES ('${ABOUT_ID}', '${content2.replace(/'/g, "''")}', datetime('now'))
   ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`
);

const rows3 = q(`SELECT * FROM about_page WHERE id = '${ABOUT_ID}'`);
assert.equal(rows3.length, 1, "still exactly one row");
const parsed3 = JSON.parse(rows3[0].content);
assert.equal(parsed3.intro.eyebrow, "HELLO", "eyebrow updated");
assert.equal(parsed3.intro.heading, "Updated heading.", "heading updated");
assert.equal(parsed3.intro.signature, "P²", "signature updated (unicode)");
assert.equal(parsed3.intro.image, "https://example.com/portrait.jpg", "image persisted");
assert.equal(parsed3.intro.imageAlt, "Portrait", "imageAlt persisted");
assert.equal(parsed3.making.heading, "Making", "making section updated");
assert.equal(parsed3.mountains.location, "Kumaon", "mountains location persisted");
assert.equal(parsed3.reading.bookTitle, "Sapiens", "book title persisted");
assert.equal(parsed3.reading.bookAuthor, "Harari", "book author persisted");
assert.equal(parsed3.now.length, 2, "now items updated to 2");
assert.equal(parsed3.now[1].icon, "MapPin", "second now item icon");
assert.equal(parsed3.closing.heading, "Bye.", "closing heading updated");
console.log("  PASS\n");

// ===========================================================
// Test 4: Read back matches what was written
// ===========================================================
console.log("Test 4: Read back matches what was written");
const rows4 = q(`SELECT content FROM about_page WHERE id = '${ABOUT_ID}'`);
const parsed4 = JSON.parse(rows4[0].content);

// Verify all sections exist
assert.ok(parsed4.intro, "intro section exists");
assert.ok(parsed4.making, "making section exists");
assert.ok(parsed4.mountains, "mountains section exists");
assert.ok(parsed4.reading, "reading section exists");
assert.ok(parsed4.now, "now section exists");
assert.ok(parsed4.closing, "closing section exists");

// Verify field types
assert.equal(typeof parsed4.intro.eyebrow, "string", "eyebrow is string");
assert.equal(typeof parsed4.intro.heading, "string", "heading is string");
assert.equal(typeof parsed4.now, "object", "now is object");
assert.ok(Array.isArray(parsed4.now), "now is array");
assert.equal(typeof parsed4.now[0], "object", "now items are objects");
assert.equal(typeof parsed4.now[0].icon, "string", "icon is string");
assert.equal(typeof parsed4.now[0].label, "string", "label is string");
assert.equal(typeof parsed4.now[0].value, "string", "value is string");
console.log("  PASS\n");

// ===========================================================
// Test 5: Empty about_page state (simulate fresh DB)
// ===========================================================
console.log("Test 5: Empty about_page state");
const rows5 = q(`SELECT * FROM about_page WHERE id = 'nonexistent'`);
assert.equal(rows5.length, 0, "nonexistent id returns no rows");
console.log("  PASS\n");

// ===========================================================
// Test 6: about_page does NOT interfere with documents table
// ===========================================================
console.log("Test 6: about_page does NOT interfere with documents table");
const docsCount = q(`SELECT COUNT(*) as cnt FROM documents`);
assert.ok(docsCount[0].cnt >= 0, "documents table still accessible");
const aboutCount = q(`SELECT COUNT(*) as cnt FROM about_page`);
assert.equal(aboutCount[0].cnt, 1, "about_page has exactly 1 row");
console.log("  PASS\n");

// ===========================================================
// Test 7: Unicode and special characters survive round-trip
// ===========================================================
console.log("Test 7: Unicode and special characters survive round-trip");
const unicodeContent = JSON.stringify({
  intro: {
    eyebrow: "ABOUT",
    heading: "It's a test — with em-dash & ampersand",
    text: "Line one.\n\nLine two with «quotes» and 日本語.",
    signature: "Prateek",
    image: "",
    imageAlt: "",
  },
  making: { heading: "", text: "", image: "", imageAlt: "", linkLabel: "", linkUrl: "" },
  mountains: { heading: "", text: "", location: "", image: "", imageAlt: "" },
  reading: { heading: "", text: "", bookTitle: "", bookAuthor: "", bookCover: "", bookCoverAlt: "" },
  now: [],
  closing: { eyebrow: "", heading: "", text: "", signature: "" },
});

d1(
  `INSERT INTO about_page (id, content, updated_at) VALUES ('unicode-test', '${unicodeContent.replace(/'/g, "''")}', datetime('now'))
   ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`
);

const rows7 = q(`SELECT content FROM about_page WHERE id = 'unicode-test'`);
const parsed7 = JSON.parse(rows7[0].content);
assert.equal(parsed7.intro.heading, "It's a test — with em-dash & ampersand", "special chars preserved");
assert.equal(parsed7.intro.text, "Line one.\n\nLine two with «quotes» and 日本語.", "unicode + newlines preserved");

// Clean up unicode test row
d1(`DELETE FROM about_page WHERE id = 'unicode-test'`);
const rows7b = q(`SELECT * FROM about_page WHERE id = 'unicode-test'`);
assert.equal(rows7b.length, 0, "unicode test row cleaned up");
console.log("  PASS\n");

// --- Cleanup ---
rmSync(PERSIST_DIR, { recursive: true });

console.log("=== All 7 about page smoke tests passed ===");
