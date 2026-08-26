import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Media repository tests — verify pure logic and round-trip shapes.
// The LIKE query used for reference checking requires real D1
// (tested via d1-smoke). Here we verify the simpler operations.

type MockRow = Record<string, unknown>;

class MockD1PreparedStatement {
  constructor(
    private db: { tables: Map<string, MockRow[]> },
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
    const { results } = await this.all<T>();
    return results[0] ?? null;
  }

  async all<T>(): Promise<{ results: T[] }> {
    const tableName = this.getTableName();
    if (!tableName) return { results: [] };
    const table = this.db.tables.get(tableName) ?? [];

    let filtered = [...table];
    const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER|\s+LIMIT|$)/i);
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+AND\s+/i);
      let idx = 0;
      for (const cond of conditions) {
        const parts = cond.trim().split(/\s*=\s*/);
        if (parts.length === 2 && idx < this.bindings.length) {
          const col = parts[0].trim();
          filtered = filtered.filter((r) => r[col] === this.bindings[idx]);
          idx++;
        }
      }
    }

    const orderMatch = this.sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const col = orderMatch[1];
      const dir = (orderMatch[2] ?? "ASC").toUpperCase();
      filtered.sort((a, b) => {
        const aVal = String(a[col] ?? "");
        const bVal = String(b[col] ?? "");
        return dir === "DESC" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      });
    }

    return { results: filtered as T[] };
  }

  async run(): Promise<{ meta: { changes: number } }> {
    const tableName = this.getTableName();
    if (!tableName) return { meta: { changes: 0 } };
    const table = this.db.tables.get(tableName) ?? [];

    if (this.sql.trimStart().toUpperCase().startsWith("INSERT")) {
      const colMatch = this.sql.match(/\(([^)]+)\)\s*VALUES/);
      if (colMatch) {
        const cols = colMatch[1].split(",").map((c) => c.trim());
        const row: MockRow = {};
        cols.forEach((col, i) => {
          row[col] = this.normalize(this.bindings[i]);
        });
        table.push(row);
        this.db.tables.set(tableName, table);
      }
      return { meta: { changes: 1 } };
    }

    if (this.sql.trimStart().toUpperCase().startsWith("DELETE")) {
      const whereMatch = this.sql.match(/WHERE\s+([\s\S]+?)$/i);
      if (whereMatch) {
        const col = whereMatch[1].trim().split(/\s*=\s*/)[0].trim();
        const binding = this.normalize(this.bindings[0]);
        const before = table.length;
        const filtered = table.filter((r) => r[col] !== binding);
        this.db.tables.set(tableName, filtered);
        return { meta: { changes: before - filtered.length } };
      }
    }

    return { meta: { changes: 0 } };
  }

  private getTableName(): string | null {
    const match = this.sql.match(/(?:INTO|FROM|UPDATE|JOIN)\s+(\w+)/i);
    return match ? match[1] : null;
  }
}

class MockD1Database {
  tables = new Map<string, MockRow[]>();

  prepare(sql: string): MockD1PreparedStatement {
    return new MockD1PreparedStatement(this, sql);
  }
}

function makeAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: "asset-1",
    storage_key: "uploads/asset-1.jpg",
    public_url: "https://pub.example.com/uploads/asset-1.jpg",
    filename: "photo.jpg",
    mime_type: "image/jpeg",
    size: 1024,
    alt: "A photo",
    created_at: "2026-08-25T12:00:00Z",
    ...overrides,
  };
}

describe("media operations (mock)", () => {
  it("inserts and retrieves a media asset", async () => {
    const db = new MockD1Database();
    const asset = makeAsset();

    await db
      .prepare(
        `INSERT INTO media_assets (id, storage_key, public_url, filename, mime_type, size, alt, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        asset.id,
        asset.storage_key,
        asset.public_url,
        asset.filename,
        asset.mime_type,
        asset.size,
        asset.alt,
        asset.created_at
      )
      .run();

    const row = await db
      .prepare("SELECT * FROM media_assets WHERE id = ?")
      .bind("asset-1")
      .first<MockRow>();

    assert.ok(row);
    assert.equal(row.filename, "photo.jpg");
    assert.equal(row.public_url, "https://pub.example.com/uploads/asset-1.jpg");
  });

  it("deletes a media asset", async () => {
    const db = new MockD1Database();
    db.tables.set("media_assets", [makeAsset()]);

    await db
      .prepare("DELETE FROM media_assets WHERE id = ?")
      .bind("asset-1")
      .run();

    const row = await db
      .prepare("SELECT * FROM media_assets WHERE id = ?")
      .bind("asset-1")
      .first();

    assert.equal(row, null);
  });

  it("returns empty for non-existent asset", async () => {
    const db = new MockD1Database();
    const row = await db
      .prepare("SELECT * FROM media_assets WHERE id = ?")
      .bind("nonexistent")
      .first();
    assert.equal(row, null);
  });
});
