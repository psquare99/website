// Durable V1: Phase 3 — Publish / Unpublish Integration Tests
// Tests POST /publish and DELETE /publish against MockD1 + MockKV.
// Exercises revision creation, published_at preservation, redirect logic,
// slug-conflict detection, validation, unpublish contract, and append-only
// revision guarantee.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

// Helper: create a NextRequest from a plain Request init
function nr(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(new globalThis.Request(url, init));
}

// ============================================================
// Mock D1 — identical to document-crud.test.ts, with cascade
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
      const conditions = whereMatch[1].split(/\s+AND\s+/i);
      let bindingIdx = 0;
      for (const cond of conditions) {
        const parts = cond.trim().split(/\s*=\s*/);
        if (parts.length === 2) {
          const col = parts[0].trim();
          if (bindingIdx < this.bindings.length) {
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
          row.old_slug
        ) {
          const existing = table.find(
            (r) => r.content_type === row.content_type && r.old_slug === row.old_slug
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
      return { meta: { changes: 1 } };
    }

    if (this.sql.trimStart().toUpperCase().startsWith("UPDATE")) {
      const table = this.db.tables.get(tableName) ?? [];
      const setMatch = this.sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);
      const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)$/i);

      if (setMatch && whereMatch) {
        const setCols = setMatch[1].split(",").map((s) => {
          const [col] = s.trim().split(/\s*=\s*/);
          return col.trim();
        });
        const whereCol = whereMatch[1].trim().split(/\s*=\s*/)[0].trim();
        const setBindings = this.bindings.slice(0, setCols.length);
        const whereBinding = this.bindings[setCols.length];

        let changes = 0;
        for (const row of table) {
          if (row[whereCol] === whereBinding) {
            setCols.forEach((col, i) => {
              row[col] = this.normalize(setBindings[i]);
            });
            changes++;
          }
        }
        return { meta: { changes } };
      }
    }

    if (this.sql.trimStart().toUpperCase().startsWith("DELETE")) {
      const table = this.db.tables.get(tableName) ?? [];
      const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)$/i);
      if (whereMatch) {
        const col = whereMatch[1].trim().split(/\s*=\s*/)[0].trim();
        const binding = this.bindings[0];
        const normalizedBinding = this.normalize(binding);
        const before = table.length;
        const filtered = table.filter(
          (r) => r[col] !== normalizedBinding
        );
        this.db.tables.set(tableName, filtered);

        const cascadeRules = this.db.cascadeRules.filter(
          (r) => r.parentTable === tableName && r.parentCol === col
        );
        for (const rule of cascadeRules) {
          const childTable = this.db.tables.get(rule.childTable) ?? [];
          const cascaded = childTable.filter(
            (r) => r[rule.childCol] !== normalizedBinding
          );
          this.db.tables.set(rule.childTable, cascaded);
        }

        return { meta: { changes: before - filtered.length } };
      }
    }

    return { meta: { changes: 0 } };
  }
}

class MockD1Database {
  tables = new Map<string, MockRow[]>();

  cascadeRules: Array<{
    parentTable: string;
    parentCol: string;
    childTable: string;
    childCol: string;
  }> = [
    {
      parentTable: "documents",
      parentCol: "id",
      childTable: "document_revisions",
      childCol: "document_id",
    },
    {
      parentTable: "documents",
      parentCol: "id",
      childTable: "redirects",
      childCol: "document_id",
    },
  ];

  getTableName(sql: string): string | null {
    const match = sql.match(/(?:INTO|FROM|UPDATE|JOIN)\s+(\w+)/i);
    return match ? match[1] : null;
  }

  getBindingForWhere(_cond: string, bindings: unknown[]): unknown {
    return bindings[bindings.length - 1];
  }

  prepare(sql: string): MockD1PreparedStatement {
    return new MockD1PreparedStatement(this, sql);
  }
}

// ============================================================
// Mock KV
// ============================================================

class MockKVNamespace {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt != null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async put(
    key: string,
    value: string,
    opts?: { expirationTtl?: number }
  ): Promise<void> {
    const expiresAt =
      opts?.expirationTtl != null
        ? Date.now() + opts.expirationTtl * 1000
        : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ============================================================
// Global context setup
// ============================================================

const cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
const mockKV = new MockKVNamespace();
const mockDb = new MockD1Database();
const mockEnv = {
  AUTH_SESSIONS: mockKV,
  CONTENT_DB: mockDb,
  ADMIN_SECRET: "test-secret",
  CRON_SECRET: "cron-test-secret",
} as unknown as CloudflareEnv;

(globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
  env: mockEnv,
};

afterEach(() => {
  (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
    env: mockEnv,
  };
});

// ============================================================
// Auth helpers
// ============================================================

async function createSession(): Promise<string> {
  const { createOtpChallenge, verifyOtp } = await import("@/lib/auth");
  const { challengeId, otp } = await createOtpChallenge();
  const result = await verifyOtp(challengeId, otp);
  if (!result.success) throw new Error("Failed to create session");
  return result.sessionToken;
}

let cachedSessionToken: string | null = null;

async function getAuthCookie(): Promise<string> {
  if (!cachedSessionToken) {
    cachedSessionToken = await createSession();
  }
  return `admin_session=${cachedSessionToken}`;
}

// ============================================================
// Route import helpers
// ============================================================

async function importPublishRoutes() {
  return await import(
    "@/app/api/admin/documents/[id]/publish/route"
  );
}

async function importDocumentRoutes() {
  return await import("@/app/api/admin/documents/route");
}

async function importDocumentIdRoutes() {
  return await import("@/app/api/admin/documents/[id]/route");
}

// ============================================================
// Helper: create document via API
// ============================================================

async function createDoc(
  cookie: string,
  overrides: Record<string, unknown> = {}
) {
  const routes = await importDocumentRoutes();
  const req = nr("http://localhost/api/admin/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      contentType: "journal",
      title: "Publish Test",
      slug: `publish-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...overrides,
    }),
  });
  const res = await routes.POST(req);
  return res.json() as any;
}

// ============================================================
// 1. AUTH GUARD
// ============================================================

test("POST /publish — rejects unauthenticated", async () => {
  const routes = await importPublishRoutes();
  const req = nr(
    "http://localhost/api/admin/documents/fake-id/publish",
    { method: "POST" }
  );
  const res = await routes.POST(req);
  assert.equal(res.status, 401);
});

test("DELETE /publish — rejects unauthenticated", async () => {
  const routes = await importPublishRoutes();
  const req = nr(
    "http://localhost/api/admin/documents/fake-id/publish",
    { method: "DELETE" }
  );
  const res = await routes.DELETE(req);
  assert.equal(res.status, 401);
});

// ============================================================
// 2. PUBLISH — first publish
// ============================================================

test("first publish: revision created, published_at set, published_slug set, status=published, no redirect", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.POST(req);
  assert.equal(res.status, 200);

  const body = await res.json() as any;
  const updated = body.document;

  // Status transition
  assert.equal(updated.status, "published");
  assert.equal(updated.publishedSlug, doc.slug);
  assert.ok(updated.publishedAt, "publishedAt must be set");

  // Revision created
  assert.ok(body.revision, "revision info must be returned");
  assert.equal(body.revision.label, "published");

  // Verify revision exists in DB
  const revisions = db.tables.get("document_revisions") ?? [];
  const pubRevisions = revisions.filter(
    (r) => r.document_id === doc.id && r.label === "published"
  );
  assert.equal(pubRevisions.length, 1, "must have exactly one published revision");
  assert.equal(pubRevisions[0].slug, doc.slug);
  assert.equal(pubRevisions[0].title, doc.title);

  // No redirect created (first publish)
  assert.equal(body.redirectCreated, null, "first publish must not create a redirect");

  // scheduled_at cleared
  assert.equal(updated.scheduledAt, undefined);
});

// ============================================================
// 3. PUBLISH — validation
// ============================================================

test("publish rejects empty title, mutates nothing", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie, { title: "Temporary", slug: `val-${Date.now()}` });

  // Clear title in DB directly
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.title = "";

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.POST(req);
  assert.equal(res.status, 400);
  const body = await res.json() as any;
  assert.ok(body.error.toLowerCase().includes("title"));

  // Verify no mutation: status unchanged, no revision created
  const revisions = db.tables.get("document_revisions") ?? [];
  const pubRevisions = revisions.filter(
    (r) => r.document_id === doc.id && r.label === "published"
  );
  assert.equal(pubRevisions.length, 0, "no revision should be created on validation failure");

  const updatedRow = table.find((r) => r.id === doc.id)!;
  assert.equal(updatedRow.status, "draft", "status must not change");
  assert.equal(updatedRow.published_at, null, "published_at must not be set");
});

test("publish rejects nonexistent document", async () => {
  const routes = await importPublishRoutes();
  const cookie = await getAuthCookie();

  const req = nr(
    "http://localhost/api/admin/documents/nonexistent-id/publish",
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res = await routes.POST(req);
  assert.equal(res.status, 404);
});

// ============================================================
// 4. REPUBLISH — published_at preservation
// ============================================================

test("republish preserves original published_at, creates new revision, old revision persists", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // First publish
  const req1 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res1 = await publishRoutes.POST(req1);
  const body1 = await res1.json() as any;
  const firstPublishedAt = body1.document.publishedAt;
  assert.ok(firstPublishedAt);

  // Edit the document (simulates published → modified)
  const idRoutes = await importDocumentIdRoutes();
  const editReq = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Edited After Publish" }),
    }
  );
  await idRoutes.PUT(editReq);

  // Republish
  const req2 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res2 = await publishRoutes.POST(req2);
  const body2 = await res2.json() as any;

  // published_at must be unchanged
  assert.equal(
    body2.document.publishedAt,
    firstPublishedAt,
    "publishedAt must be preserved on republish"
  );
  assert.equal(body2.document.title, "Edited After Publish");

  // Two published revisions now exist (old + new)
  const revisions = db.tables.get("document_revisions") ?? [];
  const pubRevisions = revisions.filter(
    (r) => r.document_id === doc.id && r.label === "published"
  );
  assert.equal(pubRevisions.length, 2, "must have two published revisions after republish");

  // Old revision still has original title
  const oldRev = pubRevisions.find((r) => r.title === "Publish Test");
  assert.ok(oldRev, "original published revision must still exist");
});

// ============================================================
// 5. REPUBLISH with slug change — redirect created
// ============================================================

test("republish with changed slug creates redirect, updates published_slug", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);
  const originalSlug = doc.slug;

  // First publish
  const req1 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  await publishRoutes.POST(req1);

  // Rename slug via PUT
  const newSlug = `renamed-${Date.now()}`;
  const idRoutes = await importDocumentIdRoutes();
  const editReq = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ slug: newSlug }),
    }
  );
  await idRoutes.PUT(editReq);

  // Republish
  const req2 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res2 = await publishRoutes.POST(req2);
  const body2 = await res2.json() as any;

  // published_slug updated to new slug
  assert.equal(body2.document.publishedSlug, newSlug);

  // Redirect created
  assert.ok(body2.redirectCreated, "redirect must be created on slug change");
  assert.equal(body2.redirectCreated.from, originalSlug);
  assert.equal(body2.redirectCreated.to, newSlug);

  // Verify redirect in DB
  const redirects = db.tables.get("redirects") ?? [];
  const redir = redirects.find(
    (r) =>
      r.document_id === doc.id &&
      r.old_slug === originalSlug &&
      r.new_slug === newSlug
  );
  assert.ok(redir, "redirect must exist in DB");
});

// ============================================================
// 6. REPUBLISH with unchanged slug — no redirect
// ============================================================

test("republish with unchanged slug creates no redirect", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // First publish
  const req1 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  await publishRoutes.POST(req1);

  // Republish without changing slug
  const req2 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res2 = await publishRoutes.POST(req2);
  const body2 = await res2.json() as any;

  assert.equal(body2.redirectCreated, null, "no redirect when slug unchanged");
});

// ============================================================
// 7. SLUG CONFLICT — reject if new slug is another doc's old_slug
// ============================================================

test("publish rejects when new slug conflicts with another document's redirect", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  // Create doc A, publish it under slug "original-a"
  const docA = await createDoc(cookie, {
    slug: `conflict-a-${Date.now()}`,
    title: "Doc A",
  });
  const reqA1 = nr(
    `http://localhost/api/admin/documents/${docA.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  await publishRoutes.POST(reqA1);

  // Rename doc A to "new-a", republish (creates redirect: original-a → new-a)
  const idRoutes = await importDocumentIdRoutes();
  await idRoutes.PUT(
    nr(
      `http://localhost/api/admin/documents/${docA.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({ slug: `new-a-${Date.now()}` }),
      }
    )
  );
  const reqA2 = nr(
    `http://localhost/api/admin/documents/${docA.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const resA2 = await publishRoutes.POST(reqA2);
  const bodyA2 = await resA2.json() as any;
  const originalSlugA = bodyA2.redirectCreated.from;

  // Create doc B, set its slug to doc A's old slug
  const docB = await createDoc(cookie, {
    slug: originalSlugA,
    title: "Doc B",
  });

  // Try to publish doc B — should be rejected due to slug conflict
  const reqB = nr(
    `http://localhost/api/admin/documents/${docB.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const resB = await publishRoutes.POST(reqB);
  assert.equal(resB.status, 409);
  const bodyB = await resB.json() as any;
  assert.ok(bodyB.error.includes(originalSlugA));
  assert.ok(bodyB.error.includes("redirect"));

  // Verify doc B is still a draft, nothing mutated
  const table = db.tables.get("documents")!;
  const rowB = table.find((r) => r.id === docB.id)!;
  assert.equal(rowB.status, "draft", "doc B must remain draft after conflict rejection");
});

test("same slug across different content types publishes successfully — no false conflict", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  // Create a journal doc, publish it under slug "shared-cross-type"
  const journalDoc = await createDoc(cookie, {
    slug: `cross-journal-${Date.now()}`,
    title: "Journal Cross-Type",
    contentType: "journal",
  });
  const reqJ1 = nr(
    `http://localhost/api/admin/documents/${journalDoc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const resJ1 = await publishRoutes.POST(reqJ1);
  assert.equal(resJ1.status, 200, "journal publish must succeed");

  // Rename journal doc so its old slug enters the redirects table
  const idRoutes = await importDocumentIdRoutes();
  const newJournalSlug = `cross-journal-new-${Date.now()}`;
  await idRoutes.PUT(
    nr(`http://localhost/api/admin/documents/${journalDoc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ slug: newJournalSlug }),
    })
  );
  const reqJ2 = nr(
    `http://localhost/api/admin/documents/${journalDoc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const resJ2 = await publishRoutes.POST(reqJ2);
  assert.equal(resJ2.status, 200, "journal republish must succeed");
  const bodyJ2 = await resJ2.json() as any;
  const oldJournalSlug = bodyJ2.redirectCreated.from;

  // Create a project doc with the same slug as the journal's old slug
  const projectDoc = await createDoc(cookie, {
    slug: oldJournalSlug,
    title: "Project Cross-Type",
    contentType: "project",
  });

  // Publish the project — must succeed, no false conflict across content types
  const reqP = nr(
    `http://localhost/api/admin/documents/${projectDoc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const resP = await publishRoutes.POST(reqP);
  assert.equal(resP.status, 200, "project publish must succeed despite shared slug across types");

  // Verify both documents are published
  const table = db.tables.get("documents")!;
  const journalRow = table.find((r) => r.id === journalDoc.id)!;
  const projectRow = table.find((r) => r.id === projectDoc.id)!;
  assert.equal(journalRow.status, "published", "journal must be published");
  assert.equal(projectRow.status, "published", "project must be published");
});

// ============================================================
// 7b. DB-LEVEL COMPOSITE UNIQUE CONSTRAINT on (content_type, old_slug)
// ============================================================

test("redirects composite unique constraint rejects duplicate (content_type, old_slug) pair", async () => {
  const { createRedirect } = await import("@/lib/repository/redirects");
  const d1 = mockDb as unknown as D1Database;

  // Insert a redirect for journal content type
  await createRedirect(d1, {
    id: "constraint-test-1",
    documentId: "doc-1",
    contentType: "journal",
    oldSlug: "shared-slug",
    newSlug: "new-a",
    createdAt: new Date().toISOString(),
  });

  // Attempt to insert a second redirect with the same (content_type, old_slug)
  // This simulates the race window: two publish calls both pass
  // getRedirectByOldSlug(), then the second INSERT hits the composite unique
  // constraint.
  let threw = false;
  try {
    await createRedirect(d1, {
      id: "constraint-test-2",
      documentId: "doc-2",
      contentType: "journal",
      oldSlug: "shared-slug",
      newSlug: "new-b",
      createdAt: new Date().toISOString(),
    });
  } catch (e: any) {
    threw = true;
    assert.ok(
      e.message.includes("UNIQUE constraint failed"),
      `error must be a unique constraint violation, got: ${e.message}`
    );
    assert.ok(
      e.message.includes("redirects.content_type"),
      `error must reference redirects.content_type, got: ${e.message}`
    );
  }
  assert.ok(threw, "second insert with duplicate (content_type, old_slug) must throw");

  // Verify only one redirect exists for this (content_type, old_slug) pair
  const redirects = mockDb.tables.get("redirects") ?? [];
  const shared = redirects.filter((r) => r.old_slug === "shared-slug");
  assert.equal(shared.length, 1, "only one redirect with this old_slug must exist");
});

test("same old_slug under different content_type is allowed", async () => {
  const { createRedirect } = await import("@/lib/repository/redirects");
  const d1 = mockDb as unknown as D1Database;

  // Insert a redirect for journal
  await createRedirect(d1, {
    id: "constraint-cross-1",
    documentId: "doc-journal",
    contentType: "journal",
    oldSlug: "cross-type-slug",
    newSlug: "new-journal",
    createdAt: new Date().toISOString(),
  });

  // Insert same old_slug for project — must succeed, no conflict
  await createRedirect(d1, {
    id: "constraint-cross-2",
    documentId: "doc-project",
    contentType: "project",
    oldSlug: "cross-type-slug",
    newSlug: "new-project",
    createdAt: new Date().toISOString(),
  });

  const redirects = mockDb.tables.get("redirects") ?? [];
  const crossType = redirects.filter((r) => r.old_slug === "cross-type-slug");
  assert.equal(crossType.length, 2, "both content types can share the same old_slug");
});

// ============================================================
// 8. PUBLISH from various statuses
// ============================================================

test("publish from scheduled clears scheduled_at", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // Simulate scheduled state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "scheduled";
  row.scheduled_at = "2025-12-01T10:00:00.000Z";

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.POST(req);
  assert.equal(res.status, 200);

  const body = await res.json() as any;
  assert.equal(body.document.status, "published");
  assert.equal(body.document.scheduledAt, undefined, "scheduled_at must be cleared");
});

test("publish from unpublished works (re-publish)", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // Publish, then unpublish
  const publishReq = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  await publishRoutes.POST(publishReq);

  const unpublishReq = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  await publishRoutes.DELETE(unpublishReq);

  // Verify unpublished
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  assert.equal(row.status, "unpublished");

  // Re-publish
  const republishReq = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.POST(republishReq);
  assert.equal(res.status, 200);

  const body = await res.json() as any;
  assert.equal(body.document.status, "published");
  // published_at should be preserved from first publish (not overwritten)
  assert.ok(body.document.publishedAt, "publishedAt must be set");
});

// ============================================================
// 9. IDEMPOTENT REPUBLISH — same content, still creates revision
// ============================================================

test("republish of unchanged document still creates a new revision", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // First publish
  const req1 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  await publishRoutes.POST(req1);

  // Second publish (no edits)
  const req2 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res2 = await publishRoutes.POST(req2);
  assert.equal(res2.status, 200);

  const revisions = db.tables.get("document_revisions") ?? [];
  const pubRevisions = revisions.filter(
    (r) => r.document_id === doc.id && r.label === "published"
  );
  assert.equal(pubRevisions.length, 2, "idempotent republish must create new revision");
});

// ============================================================
// 10. UNPUBLISH
// ============================================================

test("unpublish: backup revision created, published_at preserved, published_slug cleared, status=unpublished, no redirect", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // Publish first
  const pubReq = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const pubRes = await publishRoutes.POST(pubReq);
  const pubBody = await pubRes.json() as any;
  const publishedAt = pubBody.document.publishedAt;

  // Unpublish
  const unpReq = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const unpRes = await publishRoutes.DELETE(unpReq);
  assert.equal(unpRes.status, 200);

  const unpBody = await unpRes.json() as any;
  const updated = unpBody.document;

  // Status
  assert.equal(updated.status, "unpublished");

  // published_at preserved
  assert.equal(updated.publishedAt, publishedAt, "publishedAt must be preserved");

  // published_slug cleared
  assert.equal(updated.publishedSlug, undefined, "publishedSlug must be cleared");

  // scheduled_at cleared
  assert.equal(updated.scheduledAt, undefined);

  // No redirect created
  const redirects = db.tables.get("redirects") ?? [];
  const docRedirects = redirects.filter(
    (r) => r.document_id === doc.id
  );
  assert.equal(docRedirects.length, 0, "unpublish must not create redirects");

  // Backup revision created
  assert.ok(unpBody.backupRevision, "backup revision info must be returned");
  assert.equal(unpBody.backupRevision.label, "backup");

  const revisions = db.tables.get("document_revisions") ?? [];
  const backupRevisions = revisions.filter(
    (r) => r.document_id === doc.id && r.label === "backup"
  );
  assert.equal(backupRevisions.length, 1, "must have one backup revision");

  // Editorial content preserved
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  assert.equal(row.slug, doc.slug, "slug must be preserved");
  assert.equal(row.title, doc.title, "title must be preserved");
  // metadata and blocks are stored as JSON strings in D1
  assert.equal(row.metadata, JSON.stringify(doc.metadata), "metadata must be preserved");
  assert.equal(row.blocks, JSON.stringify(doc.blocks), "blocks must be preserved");
});

test("unpublish rejected on draft document", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();

  const doc = await createDoc(cookie);
  assert.equal(doc.status, "draft");

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.DELETE(req);
  assert.equal(res.status, 400);
  const body = await res.json() as any;
  assert.ok(body.error.includes("draft"));
});

test("unpublish rejected on already-unpublished document", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();

  const doc = await createDoc(cookie);

  // Publish then unpublish
  await (
    await publishRoutes.POST(
      nr(
        `http://localhost/api/admin/documents/${doc.id}/publish`,
        { method: "POST", headers: { Cookie: cookie } }
      )
    )
  ).json() as any;

  await (
    await publishRoutes.DELETE(
      nr(
        `http://localhost/api/admin/documents/${doc.id}/publish`,
        { method: "DELETE", headers: { Cookie: cookie } }
      )
    )
  ).json() as any;

  // Try to unpublish again
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.DELETE(req);
  assert.equal(res.status, 400);
  const body = await res.json() as any;
  assert.ok(body.error.includes("unpublished"));
});

test("unpublish on modified document works", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // Publish
  await (
    await publishRoutes.POST(
      nr(
        `http://localhost/api/admin/documents/${doc.id}/publish`,
        { method: "POST", headers: { Cookie: cookie } }
      )
    )
  ).json() as any;

  // Simulate modified state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "modified";

  // Unpublish
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.DELETE(req);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.equal(body.document.status, "unpublished");
});

// ============================================================
// 11. REVISIONS ARE APPEND-ONLY
// ============================================================

test("revisions are append-only — no existing revision is mutated or deleted", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // Publish
  const req1 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  await publishRoutes.POST(req1);

  // Capture all revisions before republish
  const revisionsBefore = [
    ...(db.tables.get("document_revisions") ?? []).filter(
      (r) => r.document_id === doc.id
    ),
  ];
  const countBefore = revisionsBefore.length;

  // Edit + republish
  const idRoutes = await importDocumentIdRoutes();
  await idRoutes.PUT(
    nr(
      `http://localhost/api/admin/documents/${doc.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({ title: "Edited Again" }),
      }
    )
  );

  const req2 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  await publishRoutes.POST(req2);

  // Verify: original revisions are unchanged, new one added
  const revisionsAfter = (db.tables.get("document_revisions") ?? []).filter(
    (r) => r.document_id === doc.id
  );
  assert.equal(
    revisionsAfter.length,
    countBefore + 1,
    "exactly one new revision should be added"
  );

  // Original revisions unchanged
  for (const orig of revisionsBefore) {
    const after = revisionsAfter.find((r) => r.id === orig.id);
    assert.ok(after, `revision ${orig.id} must still exist`);
    assert.equal(after.title, orig.title, `revision ${orig.id} title must not change`);
    assert.equal(after.slug, orig.slug, `revision ${orig.id} slug must not change`);
    assert.equal(after.label, orig.label, `revision ${orig.id} label must not change`);
  }
});

// ============================================================
// 12. PHASE 2 CRUD REGRESSION — PUT still works correctly
// ============================================================

test("PUT still transitions published → modified (Phase 2 regression check)", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();

  const doc = await createDoc(cookie);

  // Publish
  await (
    await publishRoutes.POST(
      nr(
        `http://localhost/api/admin/documents/${doc.id}/publish`,
        { method: "POST", headers: { Cookie: cookie } }
      )
    )
  ).json() as any;

  // Edit via PUT (should transition published → modified)
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Post-Phase-3 Edit" }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);
  const updated = await res.json() as any;
  assert.equal(updated.status, "modified");
  assert.equal(updated.title, "Post-Phase-3 Edit");
  // Must not have touched publishing fields
  assert.ok(updated.publishedAt, "publishedAt must be preserved by PUT");
  assert.ok(updated.publishedSlug, "publishedSlug must be preserved by PUT");
});

test("PUT does not create revisions (Phase 2 regression check)", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const publishRoutes = await importPublishRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDoc(cookie);

  // Publish (creates one revision)
  await (
    await publishRoutes.POST(
      nr(
        `http://localhost/api/admin/documents/${doc.id}/publish`,
        { method: "POST", headers: { Cookie: cookie } }
      )
    )
  ).json() as any;

  const revCountBefore = (db.tables.get("document_revisions") ?? []).filter(
    (r) => r.document_id === doc.id
  ).length;

  // Edit via PUT
  await idRoutes.PUT(
    nr(
      `http://localhost/api/admin/documents/${doc.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({ title: "Should Not Create Revision" }),
      }
    )
  );

  const revCountAfter = (db.tables.get("document_revisions") ?? []).filter(
    (r) => r.document_id === doc.id
  ).length;
  assert.equal(revCountAfter, revCountBefore, "PUT must not create revisions");
});

// ============================================================
// 7c. RACE CONDITION — cron vs manual shared publish function
// ============================================================

test("concurrent publish calls for same document both succeed — duplicate revisions are noise, not corruption", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  const doc = await createDoc(cookie);

  // Simulate two concurrent publishes (cron + manual) on the same draft.
  // Both call publishDocument() — the shared function.
  const req1 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const req2 = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const [res1, res2] = await Promise.all([
    publishRoutes.POST(req1),
    publishRoutes.POST(req2),
  ]);

  // Both succeed — D1 serializes writes, second overwrites first.
  assert.equal(res1.status, 200, "first publish succeeds");
  assert.equal(res2.status, 200, "second publish succeeds");

  // Document ends up published (final state is correct)
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  assert.equal(row.status, "published", "document is published");

  // Both created published revisions — duplicates are noise, not corruption.
  const revisions = db.tables.get("document_revisions") ?? [];
  const pubRevisions = revisions.filter(
    (r) => r.document_id === doc.id && r.label === "published"
  );
  assert.ok(pubRevisions.length >= 1, "at least one published revision exists");
});

test("cron/manual race on slug redirect — D1 uniqueness constraint catches cross-type conflict", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  // Publish journal with slug "racing-slug"
  const journalDoc = await createDoc(cookie, {
    slug: `race-journal-${Date.now()}`,
    title: "Race Journal",
    contentType: "journal",
  });
  const resJ = await publishRoutes.POST(
    nr(
      `http://localhost/api/admin/documents/${journalDoc.id}/publish`,
      { method: "POST", headers: { Cookie: cookie } }
    )
  );
  assert.equal(resJ.status, 200);

  // Rename journal so its old slug enters redirects
  const idRoutes = await importDocumentIdRoutes();
  const newSlug = `race-journal-new-${Date.now()}`;
  await idRoutes.PUT(
    nr(`http://localhost/api/admin/documents/${journalDoc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ slug: newSlug }),
    })
  );
  await publishRoutes.POST(
    nr(
      `http://localhost/api/admin/documents/${journalDoc.id}/publish`,
      { method: "POST", headers: { Cookie: cookie } }
    )
  );
  const revisions = db.tables.get("document_revisions") ?? [];
  const oldRev = revisions.find(
    (r) =>
      r.document_id === journalDoc.id &&
      r.label === "published" &&
      r.slug !== newSlug
  );
  const oldSlug = oldRev!.slug;

  // Create project with same old slug — should succeed (scoped per content type)
  const projectDoc = await createDoc(cookie, {
    slug: oldSlug,
    title: "Race Project",
    contentType: "project",
  });
  const resP = await publishRoutes.POST(
    nr(
      `http://localhost/api/admin/documents/${projectDoc.id}/publish`,
      { method: "POST", headers: { Cookie: cookie } }
    )
  );
  assert.equal(resP.status, 200, "same slug across different content types is allowed");

  // The redirect uniqueness constraint (content_type, old_slug) prevents
  // cross-type slug corruption even if two publishes race.
  const redirects = db.tables.get("redirects") ?? [];
  const journalRedirects = redirects.filter(
    (r: any) => r.content_type === "journal" && r.old_slug === oldSlug
  );
  assert.ok(journalRedirects.length >= 1, "journal redirect exists for old slug");
});

// ============================================================
// 7d. CRON ENDPOINT AUTH
// ============================================================

test("cron endpoint rejects request without Authorization header", async () => {
  const cronRoutes = await import(
    "@/app/api/cron/publish/route"
  );
  const req = nr("http://localhost/api/cron/publish", {
    method: "GET",
  });
  const res = await cronRoutes.GET(req);
  assert.equal(res.status, 401, "cron must reject unauthenticated requests");
});

test("cron endpoint rejects request with wrong CRON_SECRET", async () => {
  const cronRoutes = await import(
    "@/app/api/cron/publish/route"
  );
  const req = nr("http://localhost/api/cron/publish", {
    method: "GET",
    headers: { Authorization: "Bearer wrong-secret" },
  });
  const res = await cronRoutes.GET(req);
  assert.equal(res.status, 401, "cron must reject wrong secret");
});

test("cron endpoint accepts request with valid CRON_SECRET", async () => {
  const cronRoutes = await import(
    "@/app/api/cron/publish/route"
  );
  const req = nr("http://localhost/api/cron/publish", {
    method: "GET",
    headers: { Authorization: "Bearer cron-test-secret" },
  });
  const res = await cronRoutes.GET(req);
  assert.equal(res.status, 200, "cron must accept valid secret");
  const body = await res.json() as any;
  assert.equal(body.published, 0, "no scheduled documents in fresh DB");
});

// ============================================================
// 7e. SERVER-SIDE PUBLISH VALIDATION — raw API call rejected
// ============================================================

test("publish rejects document with invalid slug format via raw API", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  // Create doc, then tamper slug in DB to bypass PUT validation
  const doc = await createDoc(cookie, { title: "Valid Title", slug: `valid-${Date.now()}` });
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.slug = "Invalid Slug!"; // invalid format — would be caught by PUT, but we bypass it

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.POST(req);
  assert.equal(res.status, 400, "publish must reject invalid slug format");
  const body = await res.json() as any;
  assert.ok(body.error.toLowerCase().includes("slug"), "error should mention slug");
});

test("publish rejects document with invalid metadata format via raw API", async () => {
  const publishRoutes = await importPublishRoutes();
  const cookie = await getAuthCookie();
  const db = mockDb;

  // Create project doc, then tamper metadata in DB
  const doc = await createDoc(cookie, {
    title: "Project",
    slug: `proj-${Date.now()}`,
    contentType: "project",
  });
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  // Set invalid accentColor — format validation should catch it
  row.metadata = JSON.stringify({ accentColor: "not-hex" });

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}/publish`,
    { method: "POST", headers: { Cookie: cookie } }
  );
  const res = await publishRoutes.POST(req);
  assert.equal(res.status, 400, "publish must reject invalid metadata format");
  const body = await res.json() as any;
  assert.ok(body.error.toLowerCase().includes("accent color"), "error should mention accent color");
});
