// Phase 5.6: Page public-read tests
// Tests getPublishedPages() and getPublishedPage() against MockD1.
// Verifies same safety guarantees as Journal/Project:
// - Only published/modified documents are publicly visible
// - Content served matches label='published' revision, not live draft
// - Slug resolution uses published_slug
// - Missing page returns null/empty
// - D1 errors propagate

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

// ============================================================
// MockD1 — supports WHERE with = ? and IN (...) clauses
// ============================================================

interface MockRow {
  [key: string]: unknown;
}

class MockD1PreparedStatement {
  constructor(
    private db: MockD1Database,
    private sql: string,
    private bindings: unknown[] = []
  ) {}

  bind(...params: unknown[]): MockD1PreparedStatement {
    return new MockD1PreparedStatement(this.db, this.sql, params);
  }

  async first<T>(): Promise<T | null> {
    const results = await this.all<T>();
    return results.results[0] ?? null;
  }

  async all<T>(): Promise<{ results: T[] }> {
    const tableName = this.db.getTableName(this.sql);
    if (!tableName) return { results: [] };

    const table = this.db.tables.get(tableName) ?? [];
    const whereMatch = this.sql.match(
      /WHERE\s+([\s\S]+?)(?:\s+ORDER|\s+LIMIT|$)/i
    );
    let filtered = [...table];

    if (whereMatch) {
      const whereClause = whereMatch[1];

      // Handle literal IN clauses: status IN ('published', 'modified')
      const literalInMatch = whereClause.match(
        /(\w+)\s+IN\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/i
      );
      if (literalInMatch) {
        const inCol = literalInMatch[1];
        const inValues = [literalInMatch[2], literalInMatch[3]];
        filtered = filtered.filter((r) => inValues.includes(String(r[inCol])));

        // Remove the IN portion, then process remaining = ? conditions
        const remaining = whereClause
          .replace(literalInMatch[0], "")
          .replace(/^\s*AND\s*/i, "")
          .replace(/\s*AND\s*$/i, "")
          .trim();
        if (remaining) {
          const remainingConds = remaining.split(/\s+AND\s+/i);
          let bindingIdx = 0;
          for (const cond of remainingConds) {
            const parts = cond.trim().split(/\s*=\s*/);
            if (parts.length === 2 && bindingIdx < this.bindings.length) {
              const col = parts[0].trim();
              filtered = filtered.filter(
                (r) => r[col] === this.bindings[bindingIdx]
              );
              bindingIdx++;
            }
          }
        }
      } else {
        const conditions = whereClause.split(/\s+AND\s+/i);
        let bindingIdx = 0;
        for (const cond of conditions) {
          const parts = cond.trim().split(/\s*=\s*/);
          if (parts.length === 2 && bindingIdx < this.bindings.length) {
            const col = parts[0].trim();
            filtered = filtered.filter(
              (r) => r[col] === this.bindings[bindingIdx]
            );
            bindingIdx++;
          }
        }
      }
    }

    const orderMatch = this.sql.match(
      /ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i
    );
    if (orderMatch) {
      const col = orderMatch[1];
      const dir = (orderMatch[2] ?? "ASC").toUpperCase();
      filtered.sort((a, b) => {
        const aVal = String(a[col] ?? "");
        const bVal = String(b[col] ?? "");
        return dir === "DESC"
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      });
    }

    const limitMatch = this.sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      filtered = filtered.slice(0, parseInt(limitMatch[1]));
    }

    return { results: filtered as T[] };
  }

  async run(): Promise<{ meta: { changes: number } }> {
    return { meta: { changes: 0 } };
  }
}

class MockD1Database {
  tables = new Map<string, MockRow[]>();
  private failNext = false;

  setFailNext() {
    this.failNext = true;
  }

  clear() {
    this.tables.clear();
  }

  getTableName(sql: string): string | null {
    const match = sql.match(/(?:INTO|FROM|UPDATE|JOIN)\s+(\w+)/i);
    return match ? match[1] : null;
  }

  prepare(sql: string): MockD1PreparedStatement {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("D1 connection error: simulated failure");
    }
    return new MockD1PreparedStatement(this, sql);
  }
}

// ============================================================
// Global context setup
// ============================================================

const cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
const mockDb = new MockD1Database();
const mockEnv = {
  CONTENT_DB: mockDb,
} as unknown as CloudflareEnv;

(globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
  env: mockEnv,
};

afterEach(() => {
  mockDb.clear();
  (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
    env: mockEnv,
  };
});

// ============================================================
// Helpers
// ============================================================

function insertDoc(row: MockRow) {
  const table = mockDb.tables.get("documents") ?? [];
  table.push(row);
  mockDb.tables.set("documents", table);
}

function insertRevision(row: MockRow) {
  const table = mockDb.tables.get("document_revisions") ?? [];
  table.push(row);
  mockDb.tables.set("document_revisions", table);
}

function now() {
  return new Date().toISOString();
}

// ============================================================
// Tests
// ============================================================

test("getPublishedPages: returns only published/modified page documents", async () => {
  const { getPublishedPages } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "doc-published",
    content_type: "page",
    slug: "about",
    status: "published",
    published_slug: "about",
    published_at: t,
    title: "About",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-1",
    document_id: "doc-published",
    slug: "about",
    title: "About",
    metadata: JSON.stringify({ description: "About me" }),
    blocks: JSON.stringify([{ id: "b1", type: "paragraph", data: { text: "Hello" } }]),
    label: "published",
    created_at: t,
  });

  insertDoc({
    id: "doc-draft",
    content_type: "page",
    slug: "draft-page",
    status: "draft",
    published_slug: null,
    published_at: null,
    title: "Draft Page",
    updated_at: t,
    created_at: t,
  });

  insertDoc({
    id: "doc-modified",
    content_type: "page",
    slug: "now",
    status: "modified",
    published_slug: "now",
    published_at: t,
    title: "Now",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-2",
    document_id: "doc-modified",
    slug: "now",
    title: "Now",
    metadata: JSON.stringify({ description: "What I'm doing now" }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  const pages = await getPublishedPages();

  assert.equal(pages.length, 2);
  const slugs = pages.map((p) => p.slug).sort();
  assert.deepEqual(slugs, ["about", "now"]);
});

test("getPublishedPages: excludes draft pages", async () => {
  const { getPublishedPages } = await import("@/lib/publishing/public-read");

  insertDoc({
    id: "doc-draft",
    content_type: "page",
    slug: "secret",
    status: "draft",
    published_slug: null,
    published_at: null,
    title: "Secret Page",
    updated_at: now(),
    created_at: now(),
  });

  const pages = await getPublishedPages();
  assert.equal(pages.length, 0);
});

test("getPublishedPages: excludes unpublished pages", async () => {
  const { getPublishedPages } = await import("@/lib/publishing/public-read");

  insertDoc({
    id: "doc-unpub",
    content_type: "page",
    slug: "archived",
    status: "unpublished",
    published_slug: null,
    published_at: now(),
    title: "Archived Page",
    updated_at: now(),
    created_at: now(),
  });

  const pages = await getPublishedPages();
  assert.equal(pages.length, 0);
});

test("getPublishedPage: returns page by published slug", async () => {
  const { getPublishedPage } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "doc-about",
    content_type: "page",
    slug: "about",
    status: "published",
    published_slug: "about",
    published_at: t,
    title: "About",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-1",
    document_id: "doc-about",
    slug: "about",
    title: "About",
    metadata: JSON.stringify({ description: "About me" }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  const page = await getPublishedPage("about");

  assert.ok(page !== null);
  assert.equal(page!.slug, "about");
  assert.equal(page!.title, "About");
  assert.equal(page!.description, "About me");
});

test("getPublishedPage: returns null for non-existent slug", async () => {
  const { getPublishedPage } = await import("@/lib/publishing/public-read");

  const page = await getPublishedPage("nonexistent");
  assert.equal(page, null);
});

test("getPublishedPage: does not return draft page", async () => {
  const { getPublishedPage } = await import("@/lib/publishing/public-read");

  insertDoc({
    id: "doc-draft",
    content_type: "page",
    slug: "secret",
    status: "draft",
    published_slug: null,
    published_at: null,
    title: "Secret",
    updated_at: now(),
    created_at: now(),
  });

  const page = await getPublishedPage("secret");
  assert.equal(page, null);
});

test("getPublishedPages: modified page returns published revision, not live document", async () => {
  const { getPublishedPages } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "doc-mod",
    content_type: "page",
    slug: "now",
    status: "modified",
    published_slug: "now",
    published_at: t,
    title: "Now (edited)",
    updated_at: t,
    created_at: t,
  });

  // The published revision still holds the OLD title
  insertRevision({
    id: "rev-old",
    document_id: "doc-mod",
    slug: "now",
    title: "Now",
    metadata: JSON.stringify({ description: "Original description" }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  const pages = await getPublishedPages();
  assert.equal(pages.length, 1);

  // The public output should reflect the published revision's title,
  // NOT the live document's title which was edited.
  assert.equal(pages[0].title, "Now");
  assert.equal(pages[0].slug, "now");
});

test("getPublishedPages: D1 error propagates", async () => {
  const { getPublishedPages } = await import("@/lib/publishing/public-read");

  mockDb.setFailNext();

  await assert.rejects(() => getPublishedPages(), /D1 connection error/);
});

test("getPublishedPage: D1 error propagates", async () => {
  const { getPublishedPage } = await import("@/lib/publishing/public-read");

  mockDb.setFailNext();

  await assert.rejects(() => getPublishedPage("about"), /D1 connection error/);
});

test("getPublishedPages: empty state returns empty array", async () => {
  const { getPublishedPages } = await import("@/lib/publishing/public-read");

  const pages = await getPublishedPages();
  assert.ok(Array.isArray(pages));
  assert.equal(pages.length, 0);
});

test("getPublishedPage: slug resolution uses published_slug, not editorial slug", async () => {
  const { getPublishedPage } = await import("@/lib/publishing/public-read");

  const t = now();

  // Document was renamed: editorial slug is "about-v2", but published slug remains "about"
  insertDoc({
    id: "doc-rename",
    content_type: "page",
    slug: "about-v2",
    status: "modified",
    published_slug: "about",
    published_at: t,
    title: "About",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-1",
    document_id: "doc-rename",
    slug: "about",
    title: "About",
    metadata: JSON.stringify({}),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  // Should resolve at the old, currently-public URL
  const page = await getPublishedPage("about");
  assert.ok(page !== null);
  assert.equal(page!.slug, "about");

  // Should NOT resolve at the new, unpublished URL
  const page2 = await getPublishedPage("about-v2");
  assert.equal(page2, null);
});
