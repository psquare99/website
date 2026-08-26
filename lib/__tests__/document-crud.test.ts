// Durable V1: Phase 2/2.5 — Document CRUD API Integration Tests
// Tests all 5 routes against MockD1 + MockKV.
// Exercises auth guard, status transitions, validation, deletion safety,
// status-override rejection, and cascade-delete behavior.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

// Helper: create a NextRequest from a plain Request init
function nr(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(new globalThis.Request(url, init));
}

// Helper: typed JSON parse from Response
async function jsonBody<T = unknown>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

// ============================================================
// Mock D1 Database — in-memory SQL-like store
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

  private parseRow(row: MockRow): MockRow {
    const result: MockRow = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "string" && value.startsWith("{")) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  async first<T>(): Promise<T | null> {
    const results = await this.all<T>();
    return results.results[0] ?? null;
  }

  async all<T>(): Promise<{ results: T[] }> {
    const tableName = this.db.getTableName(this.sql);
    if (!tableName) return { results: [] };

    const table = this.db.tables.get(tableName) ?? [];

    // Simple WHERE handling
    const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER|\s+LIMIT|$)/i);
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

    // ORDER BY
    const orderMatch = this.sql.match(
      /ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i
    );
    if (orderMatch) {
      const col = orderMatch[1];
      const dir = (orderMatch[2] ?? "ASC").toUpperCase();
      filtered.sort((a, b) => {
        const aVal = String(a[col] ?? "");
        const bVal = String(b[col] ?? "");
        return dir === "DESC" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      });
    }

    // LIMIT
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
        // Check unique constraints
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
        if (tableName === "redirects" && row.old_slug) {
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

        // Find bindings for SET and WHERE
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
        const filtered = table.filter((r) => r[col] !== normalizedBinding);
        this.db.tables.set(tableName, filtered);

        // Enforce ON DELETE CASCADE
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

  // ON DELETE CASCADE rules: when a row is deleted from `parentTable`,
  // also delete rows from `childTable` where `childCol` matches `parentCol`.
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
    const match = sql.match(
      /(?:INTO|FROM|UPDATE|JOIN)\s+(\w+)/i
    );
    return match ? match[1] : null;
  }

  getBindingForWhere(_cond: string, bindings: unknown[]): unknown {
    // This is a simplification — the WHERE binding is the last one for simple queries
    return bindings[bindings.length - 1];
  }

  prepare(sql: string): MockD1PreparedStatement {
    return new MockD1PreparedStatement(this, sql);
  }
}

// ============================================================
// Mock KV — from Phase 1.5
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
// Auth helpers — create session + cookie
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

async function importDocumentRoutes() {
  return await import("@/app/api/admin/documents/route");
}

async function importDocumentIdRoutes() {
  return await import("@/app/api/admin/documents/[id]/route");
}

// ============================================================
// 1. AUTH GUARD — Every route rejects unauthenticated requests
// ============================================================

test("POST /api/admin/documents — rejects unauthenticated", async () => {
  const routes = await importDocumentRoutes();
  const req = nr("http://localhost/api/admin/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: "journal" }),
  });
  const res = await routes.POST(req as any);
  assert.equal(res.status, 401);
});

test("GET /api/admin/documents — rejects unauthenticated", async () => {
  const routes = await importDocumentRoutes();
  const req = nr("http://localhost/api/admin/documents");
  const res = await routes.GET(req as any);
  assert.equal(res.status, 401);
});

test("GET /api/admin/documents/[id] — rejects unauthenticated", async () => {
  const routes = await importDocumentIdRoutes();
  const req = nr("http://localhost/api/admin/documents/fake-id");
  const res = await routes.GET(req as any);
  assert.equal(res.status, 401);
});

test("PUT /api/admin/documents/[id] — rejects unauthenticated", async () => {
  const routes = await importDocumentIdRoutes();
  const req = nr("http://localhost/api/admin/documents/fake-id", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "test" }),
  });
  const res = await routes.PUT(req as any);
  assert.equal(res.status, 401);
});

test("DELETE /api/admin/documents/[id] — rejects unauthenticated", async () => {
  const routes = await importDocumentIdRoutes();
  const req = nr("http://localhost/api/admin/documents/fake-id", {
    method: "DELETE",
  });
  const res = await routes.DELETE(req as any);
  assert.equal(res.status, 401);
});

// ============================================================
// 2. CREATE — forces status=draft, validates contentType
// ============================================================

test("POST creates a draft document with generated id", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  const req = nr("http://localhost/api/admin/documents", {
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
  });

  const res = await routes.POST(req);
  assert.equal(res.status, 201);

  const doc = await res.json() as any;
  assert.equal(doc.contentType, "journal");
  assert.equal(doc.status, "draft");
  assert.equal(doc.title, "Test Journal");
  assert.equal(doc.slug, "test-journal");
  assert.ok(doc.id, "must have a generated id");
  assert.equal(doc.publishedAt, undefined);
  assert.equal(doc.publishedSlug, undefined);
  assert.equal(doc.scheduledAt, undefined);
});

test("POST ignores client-supplied status — always creates draft", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  const req = nr("http://localhost/api/admin/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      contentType: "project",
      title: "Hacked Project",
      slug: "hacked-project",
      status: "published",
    }),
  });

  const res = await routes.POST(req);
  assert.equal(res.status, 201);

  const doc = await res.json() as any;
  assert.equal(doc.status, "draft", "client-supplied status must be ignored");
});

test("POST rejects missing contentType", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  const req = nr("http://localhost/api/admin/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ title: "No Type" }),
  });

  const res = await routes.POST(req);
  assert.equal(res.status, 400);
  const body = await res.json() as any;
  assert.ok(body.error.includes("contentType"));
});

test("POST rejects invalid contentType", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  const req = nr("http://localhost/api/admin/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ contentType: "blog", title: "Blog Post" }),
  });

  const res = await routes.POST(req);
  assert.equal(res.status, 400);
});

test("POST slugifies title when no slug provided", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  const req = nr("http://localhost/api/admin/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ contentType: "journal", title: "Hello World!" }),
  });

  const res = await routes.POST(req);
  assert.equal(res.status, 201);
  const doc = await res.json() as any;
  assert.equal(doc.slug, "hello-world");
});

// ============================================================
// 3. LIST — supports contentType filter
// ============================================================

test("GET lists all documents when no filter", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  const req = nr("http://localhost/api/admin/documents", {
    headers: { Cookie: cookie },
  });

  const res = await routes.GET(req);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.ok(Array.isArray(body.documents));
  assert.ok(body.documents.length > 0, "should have at least one document");
});

test("GET filters by contentType=journal", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  // Create one of each type
  for (const ct of ["journal", "project"] as const) {
    await routes.POST(
      nr("http://localhost/api/admin/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({
          contentType: ct,
          title: `List test ${ct}`,
          slug: `list-test-${ct}-${Date.now()}`,
        }),
      })
    );
  }

  const req = nr(
    "http://localhost/api/admin/documents?contentType=journal",
    { headers: { Cookie: cookie } }
  );

  const res = await routes.GET(req);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.ok(Array.isArray(body.documents));
  for (const doc of body.documents) {
    assert.equal(doc.contentType, "journal");
  }
});

test("GET rejects invalid contentType filter", async () => {
  const routes = await importDocumentRoutes();
  const cookie = await getAuthCookie();

  const req = nr(
    "http://localhost/api/admin/documents?contentType=blog",
    { headers: { Cookie: cookie } }
  );

  const res = await routes.GET(req);
  assert.equal(res.status, 400);
});

// ============================================================
// 4. READ — get by id
// ============================================================

test("GET /[id] returns a document by id", async () => {
  const createRoutes = await importDocumentRoutes();
  const getIdRoutes = await importDocumentIdRoutes();
  const cookie = await getAuthCookie();

  // Create a document first
  const createReq = nr("http://localhost/api/admin/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      contentType: "journal",
      title: "Read Test",
      slug: `read-test-${Date.now()}`,
    }),
  });
  const createRes = await createRoutes.POST(createReq);
  const created = await createRes.json() as any;

  // Fetch it
  const getReq = nr(
    `http://localhost/api/admin/documents/${created.id}`,
    { headers: { Cookie: cookie } }
  );
  const getRes = await getIdRoutes.GET(getReq);
  assert.equal(getRes.status, 200);

  const doc = await getRes.json() as any;
  assert.equal(doc.id, created.id);
  assert.equal(doc.title, "Read Test");
});

test("GET /[id] returns 404 for nonexistent document", async () => {
  const routes = await importDocumentIdRoutes();
  const cookie = await getAuthCookie();

  const req = nr(
    "http://localhost/api/admin/documents/nonexistent-id",
    { headers: { Cookie: cookie } }
  );
  const res = await routes.GET(req);
  assert.equal(res.status, 404);
});

// ============================================================
// 5. UPDATE — status transitions and field preservation
// ============================================================

async function createDocumentViaApi(
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
      title: "Update Test",
      slug: `update-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...overrides,
    }),
  });
  const res = await routes.POST(req);
  return res.json() as any;
}

test("PUT on draft stays draft", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);
  assert.equal(doc.status, "draft");

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Updated Title" }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(updated.status, "draft");
  assert.equal(updated.title, "Updated Title");
});

test("PUT on published transitions to modified", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate published state directly in DB
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id);
  assert.ok(row, "document must exist in mock DB");
  row!.status = "published";
  row!.published_at = new Date().toISOString();
  row!.published_slug = doc.slug;

  // Edit the document
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Edited While Published" }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(
    updated.status,
    "modified",
    "published → modified on edit"
  );
  assert.equal(updated.title, "Edited While Published");

  // Must not have touched publishing fields
  assert.equal(
    updated.publishedSlug,
    doc.slug,
    "publishedSlug must be preserved"
  );
  assert.ok(updated.publishedAt, "publishedAt must be preserved");
});

test("PUT preserves publishedSlug and publishedAt on modified document", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate modified state (was published, then edited once)
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "modified";
  row.published_at = "2025-01-01T00:00:00.000Z";
  row.published_slug = "original-slug";

  // Edit again
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Second Edit" }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(updated.status, "modified");
  assert.equal(updated.publishedSlug, "original-slug");
  assert.equal(updated.publishedAt, "2025-01-01T00:00:00.000Z");
});

test("PUT on scheduled reverts to draft and clears scheduledAt", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate scheduled state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "scheduled";
  row.scheduled_at = "2025-12-01T10:00:00.000Z";

  // Edit
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Edited While Scheduled" }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(
    updated.status,
    "draft",
    "scheduled → draft on edit (no revision to protect)"
  );
  assert.equal(updated.scheduledAt, undefined, "scheduledAt must be cleared");
  assert.equal(updated.title, "Edited While Scheduled");
});

test("PUT on unpublished stays unpublished", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate unpublished state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "unpublished";
  row.published_at = "2025-01-01T00:00:00.000Z";

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Try to Resurrect" }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(
    updated.status,
    "unpublished",
    "must not resurrect to published/modified"
  );
  assert.equal(updated.title, "Try to Resurrect");
});

test("PUT does not create a revision row", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Verify no revisions exist
  const revisionsBefore = db.tables.get("document_revisions") ?? [];
  const revisionsBeforeCount = revisionsBefore.filter(
    (r) => r.document_id === doc.id
  ).length;

  // Edit
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "No Revision Created" }),
    }
  );
  await idRoutes.PUT(req);

  // Verify still no revisions
  const revisionsAfter = db.tables.get("document_revisions") ?? [];
  const revisionsAfterCount = revisionsAfter.filter(
    (r) => r.document_id === doc.id
  ).length;
  assert.equal(
    revisionsAfterCount,
    revisionsBeforeCount,
    "PUT must not create revision rows"
  );
});

test("PUT returns 404 for nonexistent document", async () => {
  const routes = await importDocumentIdRoutes();
  const cookie = await getAuthCookie();

  const req = nr(
    "http://localhost/api/admin/documents/nonexistent-id",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ title: "Ghost Edit" }),
    }
  );
  const res = await routes.PUT(req);
  assert.equal(res.status, 404);
});

// ============================================================
// 6. DELETE — rejects live content, allows draft/unpublished
// ============================================================

test("DELETE succeeds on draft document", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);
  assert.equal(doc.status, "draft");

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await idRoutes.DELETE(req);
  assert.equal(res.status, 200);

  const body = await res.json() as any;
  assert.equal(body.deleted, true);
  assert.equal(body.id, doc.id);
});

test("DELETE rejects published document", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate published state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "published";

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await idRoutes.DELETE(req);
  assert.equal(res.status, 400);

  const body = await res.json() as any;
  assert.ok(body.error.includes("published"));
  assert.ok(body.error.includes("Unpublish"));
});

test("DELETE rejects modified document", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "modified";

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await idRoutes.DELETE(req);
  assert.equal(res.status, 400);
  const body = await res.json() as any;
  assert.ok(body.error.includes("modified"));
});

test("DELETE rejects scheduled document", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "scheduled";
  row.scheduled_at = "2025-12-01T10:00:00.000Z";

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await idRoutes.DELETE(req);
  assert.equal(res.status, 400);
  const body = await res.json() as any;
  assert.ok(body.error.includes("scheduled"));
});

test("DELETE succeeds on unpublished document", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "unpublished";
  row.published_at = "2025-01-01T00:00:00.000Z";

  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await idRoutes.DELETE(req);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.equal(body.deleted, true);
});

test("DELETE returns 404 for nonexistent document", async () => {
  const routes = await importDocumentIdRoutes();
  const cookie = await getAuthCookie();

  const req = nr(
    "http://localhost/api/admin/documents/nonexistent-id",
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await routes.DELETE(req);
  assert.equal(res.status, 404);
});

// ============================================================
// 7. PUT STATUS OVERRIDE — client body must never override server status
// ============================================================

test("PUT ignores client-supplied status — draft stays draft even with status: published", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);
  assert.equal(doc.status, "draft");

  // Attempt to escalate to published via body
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: "Escalation Attempt",
        status: "published",
      }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(
    updated.status,
    "draft",
    "client-supplied status:published must be ignored"
  );
  assert.equal(updated.title, "Escalation Attempt");
});

test("PUT ignores client-supplied status — published stays modified even with status: draft", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate published state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "published";
  row.published_at = new Date().toISOString();
  row.published_slug = doc.slug;

  // Try to downgrade to draft via body
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: "Downgrade Attempt",
        status: "draft",
      }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(
    updated.status,
    "modified",
    "client-supplied status:draft must be ignored; published → modified"
  );
});

test("PUT ignores client-supplied status — unpublished stays unpublished even with status: draft", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate unpublished state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "unpublished";
  row.published_at = "2025-01-01T00:00:00.000Z";

  // Try to resurrect via body
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: "Resurrection Attempt",
        status: "published",
      }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(
    updated.status,
    "unpublished",
    "client-supplied status:published must not resurrect unpublished"
  );
});

test("PUT ignores client-supplied status — scheduled stays draft even with status: scheduled", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  const doc = await createDocumentViaApi(cookie);

  // Simulate scheduled state
  const table = db.tables.get("documents")!;
  const row = table.find((r) => r.id === doc.id)!;
  row.status = "scheduled";
  row.scheduled_at = "2025-12-01T10:00:00.000Z";

  // Try to keep it scheduled via body
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: "Keep Scheduled",
        status: "scheduled",
      }),
    }
  );
  const res = await idRoutes.PUT(req);
  assert.equal(res.status, 200);

  const updated = await res.json() as any;
  assert.equal(
    updated.status,
    "draft",
    "client-supplied status:scheduled must not prevent scheduled → draft"
  );
});

// ============================================================
// 8. CASCADE DELETE — revisions and redirects removed with document
// ============================================================

test("DELETE cascades to revisions and redirects", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  // Create a document
  const doc = await createDocumentViaApi(cookie);

  // Insert a revision row directly
  const revisions = db.tables.get("document_revisions") ?? [];
  revisions.push({
    id: "rev-1",
    document_id: doc.id,
    slug: doc.slug,
    title: doc.title,
    metadata: "{}",
    blocks: "[]",
    label: "published",
    created_at: new Date().toISOString(),
  });
  db.tables.set("document_revisions", revisions);

  // Insert a redirect row directly
  const redirects = db.tables.get("redirects") ?? [];
  redirects.push({
    id: "redir-1",
    document_id: doc.id,
    content_type: doc.contentType,
    old_slug: "old-slug",
    new_slug: doc.slug,
    created_at: new Date().toISOString(),
  });
  db.tables.set("redirects", redirects);

  // Confirm they exist before delete
  const revsBefore = (db.tables.get("document_revisions") ?? []).filter(
    (r) => r.document_id === doc.id
  );
  const redirsBefore = (db.tables.get("redirects") ?? []).filter(
    (r) => r.document_id === doc.id
  );
  assert.equal(revsBefore.length, 1, "revision must exist before delete");
  assert.equal(redirsBefore.length, 1, "redirect must exist before delete");

  // Delete the document
  const req = nr(
    `http://localhost/api/admin/documents/${doc.id}`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await idRoutes.DELETE(req);
  assert.equal(res.status, 200);

  // Verify cascade: revisions and redirects are gone
  const revsAfter = (db.tables.get("document_revisions") ?? []).filter(
    (r) => r.document_id === doc.id
  );
  const redirsAfter = (db.tables.get("redirects") ?? []).filter(
    (r) => r.document_id === doc.id
  );
  assert.equal(
    revsAfter.length,
    0,
    "revisions must be cascade-deleted with document"
  );
  assert.equal(
    redirsAfter.length,
    0,
    "redirects must be cascade-deleted with document"
  );

  // Document itself is gone
  const docAfter = (db.tables.get("documents") ?? []).find(
    (r) => r.id === doc.id
  );
  assert.equal(docAfter, undefined, "document must be deleted");
});

test("DELETE does NOT cascade to revisions/redirects of other documents", async () => {
  const idRoutes = await importDocumentIdRoutes();
  const db = mockDb;
  const cookie = await getAuthCookie();

  // Create two documents
  const docA = await createDocumentViaApi(cookie, {
    slug: `cascade-a-${Date.now()}`,
  });
  const docB = await createDocumentViaApi(cookie, {
    slug: `cascade-b-${Date.now()}`,
  });

  // Insert revisions for both
  const revisions = db.tables.get("document_revisions") ?? [];
  revisions.push({
    id: "rev-a",
    document_id: docA.id,
    slug: docA.slug,
    title: docA.title,
    metadata: "{}",
    blocks: "[]",
    label: "published",
    created_at: new Date().toISOString(),
  });
  revisions.push({
    id: "rev-b",
    document_id: docB.id,
    slug: docB.slug,
    title: docB.title,
    metadata: "{}",
    blocks: "[]",
    label: "published",
    created_at: new Date().toISOString(),
  });
  db.tables.set("document_revisions", revisions);

  // Delete doc A
  const req = nr(
    `http://localhost/api/admin/documents/${docA.id}`,
    { method: "DELETE", headers: { Cookie: cookie } }
  );
  const res = await idRoutes.DELETE(req);
  assert.equal(res.status, 200);

  // Verify: doc A's revision is gone, doc B's revision survives
  const revsAfter = db.tables.get("document_revisions") ?? [];
  const revA = revsAfter.find((r) => r.id === "rev-a");
  const revB = revsAfter.find((r) => r.id === "rev-b");
  assert.equal(revA, undefined, "doc A revision must be cascade-deleted");
  assert.notEqual(revB, undefined, "doc B revision must survive");
});
