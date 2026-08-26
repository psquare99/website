// Phase 5: Self-cleaning verification
// Creates test content via the admin API (mocked), verifies D1-backed read path,
// then cleans up so D1 returns to empty state.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

// ============================================================
// MockD1 + MockKV — full implementation for end-to-end testing
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

      const inMatch = whereClause.match(
        /(\w+)\s+IN\s*\(([^)]+)\)/i
      );
      if (inMatch) {
        const inCol = inMatch[1];
        const rawValues = inMatch[2]
          .split(",")
          .map((v) => v.trim().replace(/['"]/g, ""));
        filtered = filtered.filter((r) => rawValues.includes(String(r[inCol])));

        const remaining = whereClause
          .replace(inMatch[0], "")
          .replace(/^\s*AND\s*/i, "")
          .replace(/\s*AND\s*$/i, "")
          .trim();
        if (remaining) {
          const parts = remaining.split(/\s*=\s*/);
          if (parts.length === 2) {
            const col = parts[0].trim();
            const val = this.bindings[0];
            filtered = filtered.filter((r) => r[col] === val);
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
    if (this.sql.trimStart().toUpperCase().startsWith("INSERT")) {
      const table = this.db.tables.get(this.db.getTableName(this.sql)!) ?? [];
      const colMatch = this.sql.match(/\(([^)]+)\)\s*VALUES/);
      if (colMatch) {
        const cols = colMatch[1].split(",").map((c) => c.trim());
        const row: MockRow = {};
        cols.forEach((col, i) => {
          row[col] = this.normalize(this.bindings[i]);
        });
        if (this.db.getTableName(this.sql) === "documents" && row.content_type && row.slug) {
          const existing = table.find(
            (r) => r.content_type === row.content_type && r.slug === row.slug
          );
          if (existing) {
            throw new Error("UNIQUE constraint failed: documents.content_type, documents.slug");
          }
        }
        if (this.db.getTableName(this.sql) === "redirects" && row.old_slug) {
          const existing = table.find(
            (r) => r.content_type === row.content_type && r.old_slug === row.old_slug
          );
          if (existing) {
            throw new Error("UNIQUE constraint failed: redirects.content_type, redirects.old_slug");
          }
        }
        table.push(row);
        this.db.tables.set(this.db.getTableName(this.sql)!, table);
      }
      return { meta: { changes: 1 } };
    }

    if (this.sql.trimStart().toUpperCase().startsWith("UPDATE")) {
      const table = this.db.tables.get(this.db.getTableName(this.sql) ?? "") ?? [];
      const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)$/i);
      if (whereMatch) {
        const col = whereMatch[1].trim().split(/\s*=\s*/)[0].trim();
        const binding = this.bindings[this.bindings.length - 1];
        let changes = 0;
        for (const row of table) {
          if (row[col] === binding) {
            const setMatch = this.sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);
            if (setMatch) {
              const setCols = setMatch[1].split(",").map((s) => s.trim().split(/\s*=\s*/)[0].trim());
              setCols.forEach((c, i) => {
                if (i < this.bindings.length - 1) row[c] = this.normalize(this.bindings[i]);
              });
            }
            changes++;
          }
        }
        return { meta: { changes } };
      }
    }

    if (this.sql.trimStart().toUpperCase().startsWith("DELETE")) {
      const tableName = this.db.getTableName(this.sql) ?? "";
      const table = this.db.tables.get(tableName) ?? [];
      const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)$/i);
      if (whereMatch) {
        const col = whereMatch[1].trim().split(/\s*=\s*/)[0].trim();
        const binding = this.bindings[0];
        const filtered = table.filter((r) => r[col] !== binding);
        this.db.tables.set(tableName, filtered);
        // Cascade
        const cascadeRules = this.db.cascadeRules.filter(
          (r) => r.parentTable === tableName && r.parentCol === col
        );
        for (const rule of cascadeRules) {
          const childTable = this.db.tables.get(rule.childTable) ?? [];
          const cascaded = childTable.filter((r) => r[rule.childCol] !== binding);
          this.db.tables.set(rule.childTable, cascaded);
        }
        return { meta: { changes: table.length - filtered.length } };
      }
    }

    return { meta: { changes: 0 } };
  }
}

class MockD1Database {
  tables = new Map<string, MockRow[]>();
  cascadeRules = [
    { parentTable: "documents", parentCol: "id", childTable: "document_revisions", childCol: "document_id" },
    { parentTable: "documents", parentCol: "id", childTable: "redirects", childCol: "document_id" },
  ];

  getTableName(sql: string): string | null {
    const match = sql.match(/(?:INTO|FROM|UPDATE|JOIN)\s+(\w+)/i);
    return match ? match[1] : null;
  }

  prepare(sql: string): MockD1PreparedStatement {
    return new MockD1PreparedStatement(this, sql);
  }
}

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
  async put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void> {
    const expiresAt = opts?.expirationTtl != null ? Date.now() + opts.expirationTtl * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }
  async delete(key: string): Promise<void> { this.store.delete(key); }
}

// ============================================================
// Global context
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
  mockDb.tables.clear();
  (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
    env: mockEnv,
  };
});

// ============================================================
// Helpers
// ============================================================

function nr(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(new globalThis.Request(url, init));
}

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

// ============================================================
// Full lifecycle test — JOURNAL
// ============================================================

test("journal: full lifecycle — create, publish, edit, verify modified state, republish, unpublish, delete", async () => {
  const docRoutes = await import("@/app/api/admin/documents/route");
  const docIdRoutes = await import("@/app/api/admin/documents/[id]/route");
  const publishRoutes = await import("@/app/api/admin/documents/[id]/publish/route");
  const { getPublishedJournal, getPublishedJournalEntry } = await import("@/lib/publishing/public-read");

  const cookie = await getAuthCookie();

  // 1. Create a journal document
  const createRes = await docRoutes.POST(
    nr("http://localhost/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        contentType: "journal",
        title: "Test Journal Entry",
        slug: "test-journal-lifecycle",
        metadata: { category: "dev-logs", excerpt: "Original excerpt" },
        blocks: [{ id: "b1", type: "paragraph", data: { text: "Original content" } }],
      }),
    })
  );
  assert.equal(createRes.status, 201);
  const doc = await createRes.json() as any;
  const docId = doc.id;

  // 2. Verify not publicly visible (still draft)
  let publicEntries = await getPublishedJournal();
  assert.equal(publicEntries.length, 0, "draft must not be publicly visible");

  // 3. Publish
  const pubRes = await publishRoutes.POST(
    nr(`http://localhost/api/admin/documents/${docId}/publish`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(pubRes.status, 200);

  // 4. Verify publicly visible
  publicEntries = await getPublishedJournal();
  assert.equal(publicEntries.length, 1, "published entry must be visible");
  assert.equal(publicEntries[0].slug, "test-journal-lifecycle");
  assert.equal(publicEntries[0].title, "Test Journal Entry");

  // Verify by slug
  const entry = await getPublishedJournalEntry("test-journal-lifecycle");
  assert.ok(entry, "must be findable by published slug");
  assert.equal(entry!.title, "Test Journal Entry");

  // 5. Edit the document (triggers published → modified)
  const editRes = await docIdRoutes.PUT(
    nr(`http://localhost/api/admin/documents/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "EDITED Journal Entry (should NOT appear publicly)",
        metadata: { category: "dev-logs", excerpt: "Edited excerpt" },
      }),
    })
  );
  assert.equal(editRes.status, 200);

  // 6. CRITICAL: Verify public still shows PRE-EDIT content
  publicEntries = await getPublishedJournal();
  assert.equal(publicEntries.length, 1, "modified entry must still be publicly visible");
  assert.equal(publicEntries[0].title, "Test Journal Entry",
    "public must show ORIGINAL title, not the edited one");
  assert.equal(publicEntries[0].excerpt, "Original excerpt",
    "public must show ORIGINAL excerpt, not the edited one");

  const entryAfterEdit = await getPublishedJournalEntry("test-journal-lifecycle");
  assert.ok(entryAfterEdit);
  assert.equal(entryAfterEdit!.title, "Test Journal Entry",
    "slug lookup must also show original title");

  // 7. Republish (applies the edit)
  const repubRes = await publishRoutes.POST(
    nr(`http://localhost/api/admin/documents/${docId}/publish`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(repubRes.status, 200);

  // 8. Verify public now shows updated content
  publicEntries = await getPublishedJournal();
  assert.equal(publicEntries.length, 1);
  assert.equal(publicEntries[0].title, "EDITED Journal Entry (should NOT appear publicly)",
    "after republish, public must show updated title");

  // 9. Unpublish
  const unpubRes = await publishRoutes.DELETE(
    nr(`http://localhost/api/admin/documents/${docId}/publish`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(unpubRes.status, 200);

  // 10. Verify gone from public
  publicEntries = await getPublishedJournal();
  assert.equal(publicEntries.length, 0, "unpublished entry must not be visible");

  const goneEntry = await getPublishedJournalEntry("test-journal-lifecycle");
  assert.equal(goneEntry, null, "slug must no longer resolve");

  // 11. Delete the document
  const delRes = await docIdRoutes.DELETE(
    nr(`http://localhost/api/admin/documents/${docId}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(delRes.status, 200);

  // 12. Confirm D1 is empty
  publicEntries = await getPublishedJournal();
  assert.equal(publicEntries.length, 0, "D1 must be empty after cleanup");
});

// ============================================================
// Full lifecycle test — PROJECT
// ============================================================

test("project: full lifecycle — create, publish, edit, verify modified state, republish, unpublish, delete", async () => {
  const docRoutes = await import("@/app/api/admin/documents/route");
  const docIdRoutes = await import("@/app/api/admin/documents/[id]/route");
  const publishRoutes = await import("@/app/api/admin/documents/[id]/publish/route");
  const { getPublishedProjects, getPublishedProject } = await import("@/lib/publishing/public-read");

  const cookie = await getAuthCookie();

  const projectMetadata = {
    title: "Test Project",
    tagline: "A test",
    summary: "Test summary",
    category: "App",
    status: "building",
    accentColor: "#000",
    logo: "/logo.png",
    primaryImage: "/primary.png",
    overview: "Overview",
    why: "Why",
    version: "v1.0",
  };

  // 1. Create a project document
  const createRes = await docRoutes.POST(
    nr("http://localhost/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        contentType: "project",
        title: "Test Project",
        slug: "test-project-lifecycle",
        metadata: projectMetadata,
        blocks: [],
      }),
    })
  );
  assert.equal(createRes.status, 201);
  const doc = await createRes.json() as any;
  const docId = doc.id;

  // 2. Not visible (draft)
  let projects = await getPublishedProjects();
  assert.equal(projects.length, 0, "draft project must not be visible");

  // 3. Publish
  const pubRes = await publishRoutes.POST(
    nr(`http://localhost/api/admin/documents/${docId}/publish`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(pubRes.status, 200);

  // 4. Verify visible
  projects = await getPublishedProjects();
  assert.equal(projects.length, 1);
  assert.equal(projects[0].slug, "test-project-lifecycle");

  const project = await getPublishedProject("test-project-lifecycle");
  assert.ok(project, "must be findable by published slug");
  assert.equal(project!.title, "Test Project");

  // 5. Edit (published → modified)
  const editRes = await docIdRoutes.PUT(
    nr(`http://localhost/api/admin/documents/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "EDITED Project (should NOT appear)",
        metadata: { ...projectMetadata, title: "EDITED Project (should NOT appear)" },
      }),
    })
  );
  assert.equal(editRes.status, 200);

  // 6. CRITICAL: Public still shows pre-edit content
  projects = await getPublishedProjects();
  assert.equal(projects.length, 1);
  assert.equal(projects[0].title, "Test Project",
    "public must show ORIGINAL title, not edited");

  // 7. Republish
  const repubRes = await publishRoutes.POST(
    nr(`http://localhost/api/admin/documents/${docId}/publish`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(repubRes.status, 200);

  // 8. Now shows updated
  projects = await getPublishedProjects();
  assert.equal(projects[0].title, "EDITED Project (should NOT appear)",
    "after republish, public must show updated title");

  // 9. Unpublish
  const unpubRes = await publishRoutes.DELETE(
    nr(`http://localhost/api/admin/documents/${docId}/publish`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(unpubRes.status, 200);

  projects = await getPublishedProjects();
  assert.equal(projects.length, 0, "unpublished must not be visible");

  // 10. Delete
  const delRes = await docIdRoutes.DELETE(
    nr(`http://localhost/api/admin/documents/${docId}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    })
  );
  assert.equal(delRes.status, 200);

  // 11. Confirm empty
  projects = await getPublishedProjects();
  assert.equal(projects.length, 0, "D1 must be empty after cleanup");
});
