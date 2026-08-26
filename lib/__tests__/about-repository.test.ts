// Phase 12 — About repository unit tests
// Tests getAboutPage() and upsertAboutPage() with a MockD1 database.

import test from "node:test";
import assert from "node:assert/strict";

import type { AboutData } from "@/types/about";
import { getAboutPage, upsertAboutPage } from "@/lib/repository/about";

// ============================================================
// Minimal MockD1 — only what the about repository needs
// ============================================================

interface MockRow {
  [key: string]: unknown;
}

class MockD1PreparedStatement {
  private sql: string;
  private bindings: unknown[];

  constructor(sql: string, bindings: unknown[] = []) {
    this.sql = sql;
    this.bindings = bindings;
  }

  bind(...params: unknown[]): MockD1PreparedStatement {
    return new MockD1PreparedStatement(this.sql, params);
  }

  async first<T>(): Promise<T | null> {
    const results = await this.all<T>();
    return results.results[0] ?? null;
  }

  async all<T>(): Promise<{ results: T[] }> {
    const selectMatch = this.sql.match(/FROM\s+about_page/i);
    if (!selectMatch) return { results: [] };

    const whereMatch = this.sql.match(/WHERE\s+id\s*=\s*\?/i);
    if (whereMatch && this.bindings.length > 0) {
      const id = this.bindings[0] as string;
      const row = (globalThis as any).__aboutStore?.[id];
      if (!row) return { results: [] };
      if (this.sql.includes("SELECT")) {
        return { results: [row] as T[] };
      }
    }

    // SELECT without WHERE — return all
    if (this.sql.includes("SELECT") && !whereMatch) {
      const store = (globalThis as any).__aboutStore ?? {};
      return { results: Object.values(store) as T[] };
    }

    return { results: [] };
  }

  async run(): Promise<{ meta: { changes: number } }> {
    const insertMatch = this.sql.match(/INSERT\s+INTO\s+about_page/i);
    const onConflict = this.sql.includes("ON CONFLICT");

    if ((insertMatch || onConflict) && this.bindings.length >= 2) {
      const id = this.bindings[0] as string;
      const content = this.bindings[1] as string;
      const updatedAt = this.bindings[2] as string;

      if (!(globalThis as any).__aboutStore) {
        (globalThis as any).__aboutStore = {};
      }

      (globalThis as any).__aboutStore[id] = {
        id,
        content,
        updated_at: updatedAt,
      };

      return { meta: { changes: 1 } };
    }

    const deleteMatch = this.sql.match(/DELETE\s+FROM\s+about_page/i);
    if (deleteMatch && this.bindings.length > 0) {
      const id = this.bindings[0] as string;
      if ((globalThis as any).__aboutStore?.[id]) {
        delete (globalThis as any).__aboutStore[id];
        return { meta: { changes: 1 } };
      }
    }

    return { meta: { changes: 0 } };
  }
}

function createMockDb() {
  (globalThis as any).__aboutStore = {};

  return {
    prepare(sql: string) {
      return new MockD1PreparedStatement(sql);
    },
  } as unknown as D1Database;
}

// ============================================================
// Helpers
// ============================================================

function emptyAboutData(): AboutData {
  return {
    intro: { eyebrow: "", heading: "", text: "", signature: "", image: "", imageAlt: "" },
    making: { heading: "", text: "", image: "", imageAlt: "", linkLabel: "", linkUrl: "" },
    mountains: { heading: "", text: "", location: "", image: "", imageAlt: "" },
    reading: { heading: "", text: "", bookTitle: "", bookAuthor: "", bookCover: "", bookCoverAlt: "" },
    now: [],
    closing: { eyebrow: "", heading: "", text: "", signature: "" },
  };
}

// ============================================================
// Tests
// ============================================================

test("getAboutPage returns null when no row exists", async () => {
  const db = createMockDb();
  const result = await getAboutPage(db);
  assert.equal(result, null);
});

test("upsertAboutPage inserts a new row", async () => {
  const db = createMockDb();
  const content: AboutData = {
    ...emptyAboutData(),
    intro: {
      eyebrow: "ABOUT",
      heading: "Hello",
      text: "World",
      signature: "P",
      image: "https://example.com/img.jpg",
      imageAlt: "Photo",
    },
  };

  await upsertAboutPage(db, content);
  const result = await getAboutPage(db);

  assert.ok(result, "row exists after upsert");
  assert.equal(result!.intro.eyebrow, "ABOUT");
  assert.equal(result!.intro.heading, "Hello");
  assert.equal(result!.intro.text, "World");
  assert.equal(result!.intro.signature, "P");
  assert.equal(result!.intro.image, "https://example.com/img.jpg");
  assert.equal(result!.intro.imageAlt, "Photo");
});

test("upsertAboutPage overwrites existing row", async () => {
  const db = createMockDb();

  const content1: AboutData = {
    ...emptyAboutData(),
    intro: { eyebrow: "OLD", heading: "Old", text: "", signature: "", image: "", imageAlt: "" },
  };
  await upsertAboutPage(db, content1);

  const content2: AboutData = {
    ...emptyAboutData(),
    intro: { eyebrow: "NEW", heading: "New", text: "Updated", signature: "", image: "", imageAlt: "" },
  };
  await upsertAboutPage(db, content2);

  const result = await getAboutPage(db);
  assert.ok(result, "row exists");
  assert.equal(result!.intro.eyebrow, "NEW", "eyebrow overwritten");
  assert.equal(result!.intro.heading, "New", "heading overwritten");
  assert.equal(result!.intro.text, "Updated", "text overwritten");
});

test("upsertAboutPage persists now items", async () => {
  const db = createMockDb();
  const content: AboutData = {
    ...emptyAboutData(),
    now: [
      { icon: "Laptop", label: "Building", value: "Prime" },
      { icon: "MapPin", label: "Exploring", value: "Kumaon" },
    ],
  };

  await upsertAboutPage(db, content);
  const result = await getAboutPage(db);

  assert.ok(result);
  assert.equal(result!.now.length, 2);
  assert.equal(result!.now[0].icon, "Laptop");
  assert.equal(result!.now[0].label, "Building");
  assert.equal(result!.now[0].value, "Prime");
  assert.equal(result!.now[1].icon, "MapPin");
  assert.equal(result!.now[1].label, "Exploring");
  assert.equal(result!.now[1].value, "Kumaon");
});

test("getAboutPage merges missing sections with defaults", async () => {
  const db = createMockDb();

  // Insert partial data (simulating old data without new sections)
  (globalThis as any).__aboutStore = {
    about: {
      id: "about",
      content: JSON.stringify({
        intro: { eyebrow: "ABOUT", heading: "Hi" },
        // missing making, mountains, reading, now, closing
      }),
      updated_at: new Date().toISOString(),
    },
  };

  const result = await getAboutPage(db);
  assert.ok(result);
  assert.equal(result!.intro.eyebrow, "ABOUT");
  assert.equal(result!.intro.heading, "Hi");
  assert.equal(result!.intro.text, "", "missing text defaults to empty");
  assert.equal(result!.making.heading, "", "missing making defaults to empty");
  assert.equal(result!.mountains.heading, "", "missing mountains defaults to empty");
  assert.equal(result!.reading.heading, "", "missing reading defaults to empty");
  assert.ok(Array.isArray(result!.now), "missing now defaults to array");
  assert.equal(result!.now.length, 0, "missing now defaults to empty array");
  assert.equal(result!.closing.heading, "", "missing closing defaults to empty");
});

test("upsertAboutPage persists all sections correctly", async () => {
  const db = createMockDb();
  const content: AboutData = {
    intro: { eyebrow: "E", heading: "H", text: "T", signature: "S", image: "img", imageAlt: "alt" },
    making: { heading: "MH", text: "MT", image: "mi", imageAlt: "ma", linkLabel: "LL", linkUrl: "LU" },
    mountains: { heading: "MoH", text: "MoT", location: "Loc", image: "moi", imageAlt: "moa" },
    reading: { heading: "RH", text: "RT", bookTitle: "BT", bookAuthor: "BA", bookCover: "BC", bookCoverAlt: "BCA" },
    now: [{ icon: "Coffee", label: "Drinking", value: "Tea" }],
    closing: { eyebrow: "CE", heading: "CH", text: "CT", signature: "CS" },
  };

  await upsertAboutPage(db, content);
  const result = await getAboutPage(db);

  assert.ok(result);
  assert.equal(result!.intro.eyebrow, "E");
  assert.equal(result!.intro.image, "img");
  assert.equal(result!.making.heading, "MH");
  assert.equal(result!.making.linkLabel, "LL");
  assert.equal(result!.mountains.location, "Loc");
  assert.equal(result!.reading.bookTitle, "BT");
  assert.equal(result!.reading.bookAuthor, "BA");
  assert.equal(result!.reading.bookCover, "BC");
  assert.equal(result!.now.length, 1);
  assert.equal(result!.now[0].icon, "Coffee");
  assert.equal(result!.closing.signature, "CS");
});
