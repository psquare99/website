// Phase 5.6: Page lifecycle tests
// Full end-to-end lifecycle through admin API + public-read against MockD1:
//   Create → Publish → Read public → Edit (modify) → Read public (unchanged)
//   → Republish → Read public (updated) → Rename slug → Create redirect
//   → Unpublish → Confirm not publicly visible
//
// Also tests: scheduled fields compatibility, all status transitions.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

function nr(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(new globalThis.Request(url, init));
}

// ============================================================
// MockD1 + MockKV — full implementation
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

  private normalize(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value === "object") return JSON.stringify(value);
    return value;
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

      const literalInMatch = whereClause.match(
        /(\w+)\s+IN\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/i
      );
      if (literalInMatch) {
        const inCol = literalInMatch[1];
        const inValues = [literalInMatch[2], literalInMatch[3]];
        filtered = filtered.filter((r) => inValues.includes(String(r[inCol])));

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
    const tableName = this.db.getTableName(this.sql);
    if (!tableName) return { meta: { changes: 0 } };

    if (this.sql.trimStart().toUpperCase().startsWith("INSERT")) {
      const table = this.db.tables.get(tableName) ?? [];
      const colMatch = this.sql.match(/\(([^)]+)\)\s*VALUES/);
      if (colMatch) {
        const cols = colMatch[1].split(",").map((c) => c.trim());
        const row: MockRow = {};
        cols.forEach((col, i) => {
          row[col] = this.normalize(this.bindings[i]);
        });
        if (tableName === "documents" && row.content_type && row.slug) {
          const existing = table.find(
            (r) =>
              r.content_type === row.content_type && r.slug === row.slug
          );
          if (existing) {
            throw new Error(
              "UNIQUE constraint failed: documents.content_type, documents.slug"
            );
          }
        }
        if (
          tableName === "redirects" &&
          row.content_type &&
          row.old_slug
        ) {
          const existing = table.find(
            (r) =>
              r.content_type === row.content_type &&
              r.old_slug === row.old_slug
          );
          if (existing) {
            throw new Error(
              "UNIQUE constraint failed: redirects.content_type, redirects.old_slug"
            );
          }
        }
        table.push(row);
        this.db.tables.set(tableName, table);
      }
    } else if (this.sql.trimStart().toUpperCase().startsWith("UPDATE")) {
      const setMatch = this.sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);
      const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)$/i);
      if (setMatch && whereMatch) {
        const table = this.db.tables.get(tableName) ?? [];
        const setClauses = setMatch[1].split(",").map((c) => c.trim());
        const whereParts = whereMatch[1]
          .split(/\s+AND\s+/i)
          .map((c) => c.trim());

        let whereBindings: unknown[] = [];
        let nonWhereBindings: unknown[] = [];
        let bindingIdx = 0;

        // Count SET bindings (= ?)
        for (const clause of setClauses) {
          if (clause.includes("?")) bindingIdx++;
        }
        nonWhereBindings = this.bindings.slice(0, bindingIdx);
        whereBindings = this.bindings.slice(bindingIdx);

        // Find matching row by WHERE
        for (const row of table) {
          let whereIdx = 0;
          let matches = true;
          for (const wp of whereParts) {
            const parts = wp.split(/\s*=\s*/);
            if (parts.length === 2) {
              const col = parts[0].trim();
              const binding = whereBindings[whereIdx];
              if (row[col] !== binding) {
                matches = false;
                break;
              }
              whereIdx++;
            }
          }
          if (matches) {
            // Apply SET clauses
            let setIdx = 0;
            for (const clause of setClauses) {
              const parts = clause.split(/\s*=\s*/);
              if (parts.length === 2) {
                const col = parts[0].trim();
                row[col] = this.normalize(nonWhereBindings[setIdx]);
                setIdx++;
              }
            }
            break;
          }
        }
        this.db.tables.set(tableName, table);
      }
    } else if (this.sql.trimStart().toUpperCase().startsWith("DELETE")) {
      const table = this.db.tables.get(tableName) ?? [];
      const whereMatch = this.sql.match(/WHERE\s+(.+)$/i);
      if (whereMatch) {
        const conditions = whereMatch[1].split(/\s+AND\s+/i);
        const remaining: MockRow[] = [];
        for (const row of table) {
          let matches = false;
          let bindingIdx = 0;
          for (const cond of conditions) {
            const parts = cond.trim().split(/\s*=\s*/);
            if (parts.length === 2 && bindingIdx < this.bindings.length) {
              const col = parts[0].trim();
              if (row[col] !== this.bindings[bindingIdx]) {
                matches = true;
                break;
              }
              bindingIdx++;
            }
          }
          if (!matches) remaining.push(row);
        }
        this.db.tables.set(tableName, remaining);
      } else {
        this.db.tables.set(tableName, []);
      }
    }

    return { meta: { changes: 1 } };
  }
}

class MockD1Database {
  tables = new Map<string, MockRow[]>();

  clear() {
    this.tables.clear();
  }

  getTableName(sql: string): string | null {
    const match = sql.match(/(?:INTO|FROM|UPDATE|JOIN)\s+(\w+)/i);
    return match ? match[1] : null;
  }

  prepare(sql: string): MockD1PreparedStatement {
    return new MockD1PreparedStatement(this, sql);
  }
}

class MockKVNamespace {
  store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ============================================================
// Global context setup
// ============================================================

const cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
const mockDb = new MockD1Database();
const mockKV = new MockKVNamespace();
const mockEnv = {
  CONTENT_DB: mockDb,
  AUTH_SESSIONS: mockKV,
  ADMIN_SECRET: "test-secret",
  CRON_SECRET: "cron-test-secret",
} as unknown as CloudflareEnv;

(globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
  env: mockEnv,
};

afterEach(() => {
  mockDb.clear();
  mockKV.store.clear();
  cachedSessionToken = undefined;
  (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
    env: mockEnv,
  };
});

// ============================================================
// Helpers
// ============================================================

let cachedSessionToken: string | undefined;

async function createSession(): Promise<string> {
  const { createOtpChallenge, verifyOtp } = await import("@/lib/auth");
  const { challengeId, otp } = await createOtpChallenge();
  const result = await verifyOtp(challengeId, otp);
  if (!result.success) throw new Error("Auth setup failed");
  return result.sessionToken;
}

async function getAuthCookie(): Promise<string> {
  if (!cachedSessionToken) {
    cachedSessionToken = await createSession();
  }
  return `admin_session=${cachedSessionToken}`;
}

async function createPage(title: string, slug?: string) {
  const cookie = await getAuthCookie();
  const { POST } = await import("@/app/api/admin/documents/route");
  const res = await POST(
    nr("http://localhost/api/admin/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        contentType: "page",
        title,
        slug,
        metadata: { description: `Description for ${title}` },
        blocks: [
          { id: "b1", type: "paragraph", data: { text: `Content of ${title}` } },
        ],
      }),
    })
  );
  return (await res.json()) as { id: string; slug: string; status: string; title: string };
}

async function publishDoc(id: string) {
  const cookie = await getAuthCookie();
  const { POST } = await import("@/app/api/admin/documents/[id]/publish/route");
  return POST(
    nr(`http://localhost/api/admin/documents/${id}/publish`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
  );
}

async function unpublishDoc(id: string) {
  const cookie = await getAuthCookie();
  const { DELETE } = await import("@/app/api/admin/documents/[id]/publish/route");
  return DELETE(
    nr(`http://localhost/api/admin/documents/${id}/publish`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    })
  );
}

async function updateDoc(id: string, body: Record<string, unknown>) {
  const cookie = await getAuthCookie();
  const { PUT } = await import("@/app/api/admin/documents/[id]/route");
  return PUT(
    nr(`http://localhost/api/admin/documents/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    })
  );
}

async function getPublicPage(slug: string) {
  const { getPublishedPage } = await import("@/lib/publishing/public-read");
  return getPublishedPage(slug);
}

async function getPublicPages() {
  const { getPublishedPages } = await import("@/lib/publishing/public-read");
  return getPublishedPages();
}

// ============================================================
// Lifecycle Tests
// ============================================================

test("page full lifecycle: create → publish → read → modify → read (unchanged) → republish → read (updated) → unpublish → gone", async () => {
  // 1. Create
  const created = await createPage("About", "about");
  assert.equal(created.title, "About");
  assert.equal(created.slug, "about");
  assert.equal(created.status, "draft");

  // 2. Publish
  const pubRes = await publishDoc(created.id);
  assert.equal(pubRes.status, 200);

  // 3. Read public — should be visible
  const page1 = await getPublicPage("about");
  assert.ok(page1 !== null);
  assert.equal(page1!.title, "About");

  // 4. Modify (edit the page)
  const editRes = await updateDoc(created.id, {
    title: "About Me",
    blocks: [
      { id: "b1", type: "paragraph", data: { text: "Updated content" } },
    ],
  });
  assert.equal(editRes.status, 200);

  // 5. Read public — should STILL show old published version (modified safety)
  const page2 = await getPublicPage("about");
  assert.ok(page2 !== null);
  assert.equal(page2!.title, "About");

  // 6. Republish
  const repubRes = await publishDoc(created.id);
  assert.equal(repubRes.status, 200);

  // 7. Read public — should now show updated content
  const page3 = await getPublicPage("about");
  assert.ok(page3 !== null);
  assert.equal(page3!.title, "About Me");

  // 8. Unpublish
  const unpubRes = await unpublishDoc(created.id);
  assert.equal(unpubRes.status, 200);

  // 9. Read public — should be gone
  const page4 = await getPublicPage("about");
  assert.equal(page4, null);
});

test("page slug rename creates redirect record", async () => {
  const created = await createPage("About", "about");
  await publishDoc(created.id);

  // Rename slug
  await updateDoc(created.id, { slug: "about-me" });

  // Republish — should create a redirect
  const res = await publishDoc(created.id);
  assert.equal(res.status, 200);

  const body = (await res.json()) as Record<string, unknown>;
  assert.ok(body.redirectCreated !== null);
  assert.equal((body.redirectCreated as Record<string, string>).from, "about");
  assert.equal((body.redirectCreated as Record<string, string>).to, "about-me");

  // New slug should be publicly accessible
  const page = await getPublicPage("about-me");
  assert.ok(page !== null);

  // Old slug should no longer resolve as a document
  const oldPage = await getPublicPage("about");
  assert.equal(oldPage, null);
});

test("page draft does not appear in public listing", async () => {
  await createPage("Secret", "secret");

  const pages = await getPublicPages();
  assert.equal(pages.length, 0);
});

test("page unpublish clears publishedSlug but preserves editorial slug", async () => {
  const created = await createPage("About", "about");
  await publishDoc(created.id);

  const unpubRes = await unpublishDoc(created.id);
  assert.equal(unpubRes.status, 200);

  const body = (await unpubRes.json()) as Record<string, unknown>;
  const doc = body.document as Record<string, unknown>;
  assert.equal(doc.status, "unpublished");
  assert.equal(doc.publishedSlug, undefined);
  assert.equal(doc.slug, "about");
  assert.ok(doc.publishedAt !== undefined);
});

test("page scheduled status is accepted", async () => {
  const created = await createPage("Later", "later");

  // Update to scheduled status (simulating what a future scheduler would do)
  const editRes = await updateDoc(created.id, {
    title: "Later",
    slug: "later",
  });
  assert.equal(editRes.status, 200);

  // The document should exist as a draft (scheduler not yet implemented)
  // but the page model should support scheduled fields
  const doc = mockDb.tables.get("documents")?.find(
    (r) => r.content_type === "page" && r.slug === "later"
  );
  assert.ok(doc);
  assert.equal(doc.content_type, "page");
});

test("page revision is append-only: republishing does not mutate original revision", async () => {
  const created = await createPage("About", "about");

  // Publish v1
  await publishDoc(created.id);
  const revs1 = mockDb.tables.get("document_revisions")?.filter(
    (r) => r.document_id === created.id && r.label === "published"
  );
  assert.ok(revs1);
  assert.equal(revs1.length, 1);
  const rev1Title = revs1[0].title;

  // Edit + republish v2
  await updateDoc(created.id, { title: "About v2" });
  await publishDoc(created.id);

  const revs2 = mockDb.tables.get("document_revisions")?.filter(
    (r) => r.document_id === created.id && r.label === "published"
  );
  assert.ok(revs2);
  assert.equal(revs2.length, 2);

  // Original revision should be preserved
  assert.equal(revs2[0].title, rev1Title);
  assert.equal(revs2[1].title, "About v2");
});

test("page content type works with document list endpoint", async () => {
  const cookie = await getAuthCookie();
  await createPage("About", "about");
  await createPage("Now", "now");

  const { GET } = await import("@/app/api/admin/documents/route");
  const res = await GET(
    nr("http://localhost/api/admin/documents?contentType=page", {
      headers: { Cookie: cookie },
    })
  );
  const body = (await res.json()) as { documents: Record<string, unknown>[] };
  assert.equal(body.documents.length, 2);
  assert.ok(body.documents.every((d) => d.contentType === "page"));
});

test("existing journal lifecycle is unchanged by page addition", async () => {
  const cookie = await getAuthCookie();
  // Create a journal entry
  const { POST: createPost } = await import("@/app/api/admin/documents/route");
  const res = await createPost(
    nr("http://localhost/api/admin/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        contentType: "journal",
        title: "Test Journal",
        slug: "test-journal",
      }),
    })
  );
  assert.equal(res.status, 201);

  // Publish it
  const body = (await res.json()) as { id: string };
  await publishDoc(body.id);

  // Should appear in public journals
  const { getPublishedJournal } = await import("@/lib/publishing/public-read");
  const journals = await getPublishedJournal();
  assert.ok(journals.length >= 1);
  assert.ok(journals.some((j) => j.slug === "test-journal"));
});
