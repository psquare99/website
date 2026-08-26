// Phase 5: Public read function tests
// Tests getPublishedJournal(), getPublishedJournalEntry(),
// getPublishedProjects(), getPublishedProject() against MockD1.
//
// Verifies:
// - Only published/modified documents are publicly visible
// - Content served matches the label='published' revision, not the live draft
// - Slug resolution uses published_slug, not the editorial slug
// - Error propagation (DB errors never silently become empty results)

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

      // Check for IN clause: "col IN (?, ?)" with corresponding bindings
      const inMatch = whereClause.match(/(\w+)\s+IN\s*\(\s*\?\s*(?:,\s*\?\s*)*\)/i);
      if (inMatch) {
        const inCol = inMatch[1];
        // Count ? in the IN clause
        const inQuestionMarks = (inMatch[0].match(/\?/g) ?? []).length;
        // The IN bindings are the LAST N bindings
        const inValues = this.bindings.slice(-inQuestionMarks);
        filtered = filtered.filter((r) => inValues.includes(r[inCol]));

        // Remove the IN portion and process remaining conditions
        const remaining = whereClause.replace(inMatch[0], "").replace(/^\s*AND\s*/i, "").replace(/\s*AND\s*$/i, "").trim();
        if (remaining) {
          const parts = remaining.split(/\s*=\s*/);
          if (parts.length === 2) {
            const col = parts[0].trim();
            // The non-IN binding is the first one
            const val = this.bindings[0];
            filtered = filtered.filter((r) => r[col] === val);
          }
        }
      } else {
        // Simple = ? conditions
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

test("getPublishedJournal: only returns published/modified documents", async () => {
  const { getPublishedJournal } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "doc-published",
    content_type: "journal",
    slug: "published-entry",
    status: "published",
    published_slug: "published-entry",
    published_at: t,
    title: "Published Entry",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-published",
    document_id: "doc-published",
    slug: "published-entry",
    title: "Published Entry",
    metadata: JSON.stringify({ category: "dev-logs" }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  insertDoc({
    id: "doc-draft",
    content_type: "journal",
    slug: "draft-entry",
    status: "draft",
    published_slug: null,
    published_at: null,
    title: "Draft Entry",
    updated_at: t,
    created_at: t,
  });

  insertDoc({
    id: "doc-unpublished",
    content_type: "journal",
    slug: "unpublished-entry",
    status: "unpublished",
    published_slug: null,
    published_at: t,
    title: "Unpublished Entry",
    updated_at: t,
    created_at: t,
  });

  insertDoc({
    id: "doc-modified",
    content_type: "journal",
    slug: "modified-entry",
    status: "modified",
    published_slug: "modified-entry",
    published_at: t,
    title: "Modified Entry",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-modified",
    document_id: "doc-modified",
    slug: "modified-entry",
    title: "Modified Entry",
    metadata: JSON.stringify({ category: "reflections" }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  const entries = await getPublishedJournal();
  const slugs = entries.map((e) => e.slug);

  assert.ok(slugs.includes("published-entry"), "published doc must appear");
  assert.ok(slugs.includes("modified-entry"), "modified doc must appear");
  assert.ok(!slugs.includes("draft-entry"), "draft doc must NOT appear");
  assert.ok(!slugs.includes("unpublished-entry"), "unpublished doc must NOT appear");
});

test("content matches the published revision, not the live document", async () => {
  const { getPublishedJournal } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "doc-rev-test",
    content_type: "journal",
    slug: "rev-test",
    status: "published",
    published_slug: "rev-test",
    published_at: t,
    title: "Live Title (should NOT appear)",
    updated_at: t,
    created_at: t,
  });

  insertRevision({
    id: "rev-1",
    document_id: "doc-rev-test",
    slug: "rev-test",
    title: "Revision Title (SHOULD appear)",
    metadata: JSON.stringify({ category: "from-revision" }),
    blocks: JSON.stringify([
      { id: "b1", type: "paragraph", data: { text: "Revision content" } },
    ]),
    label: "published",
    created_at: t,
  });

  const entries = await getPublishedJournal();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, "Revision Title (SHOULD appear)");
  assert.equal(entries[0].category, "from-revision");
});

test("modified doc shows pre-edit published content, not unpublished edits", async () => {
  const { getPublishedJournal } = await import("@/lib/publishing/public-read");

  const t1 = "2026-01-01T00:00:00.000Z";
  const t2 = "2026-06-01T00:00:00.000Z";

  insertDoc({
    id: "doc-mod-test",
    content_type: "journal",
    slug: "mod-test",
    status: "modified",
    published_slug: "mod-test",
    published_at: t1,
    title: "Version B (live draft — should NOT appear)",
    updated_at: t2,
    created_at: t1,
  });

  insertRevision({
    id: "rev-mod",
    document_id: "doc-mod-test",
    slug: "mod-test",
    title: "Version A (published — SHOULD appear)",
    metadata: JSON.stringify({ category: "dev-logs" }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t1,
  });

  const entries = await getPublishedJournal();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, "Version A (published — SHOULD appear)",
    "must serve revision content, not live draft");
});

test("slug resolution uses published_slug, not editorial slug", async () => {
  const { getPublishedJournalEntry } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "doc-slug-test",
    content_type: "journal",
    slug: "new-slug",
    status: "modified",
    published_slug: "old-slug",
    published_at: t,
    title: "Slug Test",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-slug",
    document_id: "doc-slug-test",
    slug: "old-slug",
    title: "Slug Test",
    metadata: JSON.stringify({ category: "dev-logs" }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  const entry = await getPublishedJournalEntry("old-slug");
  assert.ok(entry, "must find entry via published_slug");
  assert.equal(entry!.title, "Slug Test");

  const notFound = await getPublishedJournalEntry("new-slug");
  assert.equal(notFound, null, "must NOT find entry via unpublished editorial slug");
});

test("getPublishedProjects: only returns published/modified documents", async () => {
  const { getPublishedProjects } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "proj-published",
    content_type: "project",
    slug: "my-project",
    status: "published",
    published_slug: "my-project",
    published_at: t,
    title: "My Project",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-proj",
    document_id: "proj-published",
    slug: "my-project",
    title: "My Project",
    metadata: JSON.stringify({
      title: "My Project",
      tagline: "A test project",
      summary: "Test summary",
      category: "App",
      status: "building",
      accentColor: "#000",
      logo: "/logo.png",
      primaryImage: "/primary.png",
      overview: "Overview",
      why: "Why",
      version: "v1.0",
    }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  insertDoc({
    id: "proj-draft",
    content_type: "project",
    slug: "draft-project",
    status: "draft",
    published_slug: null,
    published_at: null,
    title: "Draft Project",
    updated_at: t,
    created_at: t,
  });

  const projects = await getPublishedProjects();
  const slugs = projects.map((p) => p.slug);

  assert.ok(slugs.includes("my-project"), "published project must appear");
  assert.ok(!slugs.includes("draft-project"), "draft project must NOT appear");
});

test("getPublishedProject finds by published_slug", async () => {
  const { getPublishedProject } = await import("@/lib/publishing/public-read");

  const t = now();

  insertDoc({
    id: "proj-slug",
    content_type: "project",
    slug: "new-slug",
    status: "published",
    published_slug: "old-slug",
    published_at: t,
    title: "Slug Project",
    updated_at: t,
    created_at: t,
  });
  insertRevision({
    id: "rev-proj-slug",
    document_id: "proj-slug",
    slug: "old-slug",
    title: "Slug Project",
    metadata: JSON.stringify({
      title: "Slug Project",
      tagline: "Tag",
      summary: "Summary",
      category: "App",
      status: "building",
      accentColor: "#000",
      logo: "/logo.png",
      primaryImage: "/primary.png",
      overview: "Overview",
      why: "Why",
      version: "v1.0",
    }),
    blocks: JSON.stringify([]),
    label: "published",
    created_at: t,
  });

  const found = await getPublishedProject("old-slug");
  assert.ok(found, "must find via published_slug");
  assert.equal(found!.title, "Slug Project");

  const notFound = await getPublishedProject("new-slug");
  assert.equal(notFound, null, "must NOT find via editorial slug");
});

test("DB error propagates — not silently caught as empty result", async () => {
  const { getPublishedJournal } = await import("@/lib/publishing/public-read");

  mockDb.setFailNext();

  let threw = false;
  try {
    await getPublishedJournal();
  } catch (e: any) {
    threw = true;
    assert.ok(
      e.message.includes("D1 connection error"),
      `must propagate D1 error, got: ${e.message}`
    );
  }
  assert.ok(threw, "D1 error must propagate, not be caught into empty array");
});

test("genuine empty state returns empty array (not an error)", async () => {
  const { getPublishedJournal } = await import("@/lib/publishing/public-read");

  const entries = await getPublishedJournal();
  assert.deepEqual(entries, [], "empty D1 must return empty array");
});
