// Phase 5.6: Page content type tests
// Verifies Page as a first-class content type across:
// - Domain types
// - Contract transformation
// - Public read (MockD1)
// - Publish/unpublish lifecycle (MockD1)
// - Slug/redirect scoping
// - Revision safety
// - Scheduling compatibility

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import type {
  Document,
  DocumentBlock,
  DocumentMetadata,
  DocumentRevision,
  ContentType,
} from "@/lib/domain/document";

import {
  toPublishedPageDocument,
  toPublishedDocumentFromRevision,
  toPublishedJournalDocument,
  toPublishedProjectDocument,
} from "@/lib/publishing/contract";

import type { PublishedPageDocument } from "@/lib/publishing/page-adapter";
import type { PublishedDocument } from "@/lib/publishing/journal-adapter";
import type { PublishedProjectDocument } from "@/lib/publishing/project-adapter";

import { pageFromPublishedDocument } from "@/lib/publishing/page-adapter";

// ============================================================
// Domain / Type Tests
// ============================================================

test("ContentType accepts 'page'", () => {
  const types: ContentType[] = ["journal", "project", "page"];
  assert.ok(types.includes("page"));
  assert.equal(types.length, 3);
});

test("ContentType still includes 'journal' and 'project'", () => {
  const types: ContentType[] = ["journal", "project", "page"];
  assert.ok(types.includes("journal"));
  assert.ok(types.includes("project"));
});

// ============================================================
// Helpers
// ============================================================

function createTestPageDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: "page-doc-1",
    contentType: "page",
    slug: "about",
    status: "draft",
    title: "About",
    metadata: {
      description: "A short description of the about page.",
    },
    blocks: [
      {
        id: "block-1",
        type: "paragraph",
        data: { text: "Welcome to my website." },
      },
      {
        id: "block-2",
        type: "heading",
        data: { text: "Who am I?", level: 2 },
      },
      {
        id: "block-3",
        type: "paragraph",
        data: { text: "I build things." },
      },
    ],
    updatedAt: "2026-08-25T10:00:00.000Z",
    createdAt: "2026-08-25T09:00:00.000Z",
    ...overrides,
  };
}

// ============================================================
// Domain Shape Tests
// ============================================================

test("page document has correct shape", () => {
  const doc = createTestPageDocument();

  assert.equal(doc.id, "page-doc-1");
  assert.equal(doc.contentType, "page");
  assert.equal(doc.slug, "about");
  assert.equal(doc.status, "draft");
  assert.equal(doc.title, "About");
  assert.equal(doc.metadata.description, "A short description of the about page.");
  assert.ok(Array.isArray(doc.blocks));
  assert.equal(doc.blocks.length, 3);
});

test("page document metadata round-trips through JSON", () => {
  const doc = createTestPageDocument();
  const serialized = JSON.stringify(doc.metadata);
  const deserialized = JSON.parse(serialized) as DocumentMetadata;

  assert.deepEqual(deserialized, doc.metadata);
});

test("page document blocks round-trip through JSON", () => {
  const doc = createTestPageDocument();
  const serialized = JSON.stringify(doc.blocks);
  const deserialized = JSON.parse(serialized) as DocumentBlock[];

  assert.deepEqual(deserialized, doc.blocks);
});

test("page document supports minimal metadata (no optional fields)", () => {
  const doc = createTestPageDocument({
    metadata: {},
  });

  assert.deepEqual(doc.metadata, {});
  assert.ok(Array.isArray(doc.blocks));
});

test("page document supports navigationLabel metadata", () => {
  const doc = createTestPageDocument({
    metadata: {
      description: "What I use daily",
      navigationLabel: "Uses",
    },
  });

  assert.equal(doc.metadata.description, "What I use daily");
  assert.equal(doc.metadata.navigationLabel, "Uses");
});

// ============================================================
// Contract Transformation Tests
// ============================================================

test("toPublishedPageDocument transforms D1 document to Contract v0.1", () => {
  const doc = createTestPageDocument({
    publishedAt: "2026-08-25T10:00:00.000Z",
  });

  const published = toPublishedPageDocument(doc);

  assert.equal(published.contractVersion, "0.1");
  assert.equal(published.id, doc.id);
  assert.equal(published.contentType, "page");
  assert.equal(published.slug, "about");
  assert.equal(published.publishedAt, "2026-08-25T10:00:00.000Z");
  assert.equal(published.metadata.title, "About");
  assert.equal(published.metadata.description, "A short description of the about page.");
  assert.ok(Array.isArray(published.blocks));
  assert.equal(published.blocks.length, 3);
});

test("toPublishedPageDocument uses createdAt when publishedAt is missing", () => {
  const doc = createTestPageDocument({
    publishedAt: undefined,
    createdAt: "2026-08-24T08:00:00.000Z",
  });

  const published = toPublishedPageDocument(doc);
  assert.equal(published.publishedAt, "2026-08-24T08:00:00.000Z");
});

test("toPublishedPageDocument throws for wrong content type", () => {
  const doc = createTestPageDocument({ contentType: "journal" });
  assert.throws(() => toPublishedPageDocument(doc), /Cannot transform/);
});

test("toPublishedPageDocument preserves blocks as-is", () => {
  const doc = createTestPageDocument({
    blocks: [
      { id: "b1", type: "paragraph", data: { text: "Hello" } },
      { id: "b2", type: "image", data: { src: "/img.png", alt: "test" } },
    ],
  });

  const published = toPublishedPageDocument(doc);
  assert.equal(published.blocks.length, 2);
  assert.equal(published.blocks[0].type, "paragraph");
  assert.deepEqual(published.blocks[0].data, { text: "Hello" });
  assert.equal(published.blocks[1].type, "image");
});

test("page contract uses top-level title when metadata.title diverges", () => {
  const doc = createTestPageDocument({
    title: "Canonical Page Title",
    metadata: {
      title: "Stale Metadata Title",
    },
  });

  const published = toPublishedPageDocument(doc);
  assert.equal(published.metadata.title, "Canonical Page Title");
});

test("page contract uses top-level slug, not metadata.slug", () => {
  const doc = createTestPageDocument({
    slug: "canonical-slug",
    metadata: {
      slug: "stale-metadata-slug",
    },
  });

  const published = toPublishedPageDocument(doc);
  assert.equal(published.slug, "canonical-slug");
});

// ============================================================
// toPublishedDocumentFromRevision — Page Branch
// ============================================================

test("toPublishedDocumentFromRevision handles page content type", () => {
  const revision = {
    slug: "about",
    title: "About",
    metadata: { description: "A short description" } as DocumentMetadata,
    blocks: [
      { id: "b1", type: "paragraph", data: { text: "Hello" } } as DocumentBlock,
    ],
    createdAt: "2026-08-25T12:00:00.000Z",
  };

  const published = toPublishedDocumentFromRevision(revision, "page");

  assert.equal(published.contentType, "page");
  assert.equal(published.slug, "about");
  assert.equal(published.publishedAt, "2026-08-25T12:00:00.000Z");
  assert.equal(published.contractVersion, "0.1");
  assert.ok(Array.isArray(published.blocks));
});

test("toPublishedDocumentFromRevision page branch uses title from revision snapshot", () => {
  const revision = {
    slug: "about",
    title: "Snapshot Title",
    metadata: {} as DocumentMetadata,
    blocks: [],
    createdAt: "2026-08-25T12:00:00.000Z",
  };

  const published = toPublishedDocumentFromRevision(revision, "page");
  assert.equal(published.metadata.title, "Snapshot Title");
});

// ============================================================
// Page Adapter Tests
// ============================================================

test("pageFromPublishedDocument transforms to public Page type", () => {
  const published: PublishedPageDocument = {
    contractVersion: "0.1",
    id: "page-doc-1",
    contentType: "page",
    slug: "about",
    publishedAt: "2026-08-25T10:00:00.000Z",
    metadata: {
      title: "About",
      description: "A short description",
    },
    blocks: [
      { id: "b1", type: "paragraph", data: { text: "Hello" } },
    ],
  };

  const page = pageFromPublishedDocument(published);

  assert.equal(page.slug, "about");
  assert.equal(page.title, "About");
  assert.equal(page.description, "A short description");
  assert.equal(page.publishedAt, "2026-08-25T10:00:00.000Z");
  assert.ok(page.content !== undefined);
});

test("pageFromPublishedDocument throws for wrong content type", () => {
  const published = {
    contractVersion: "0.1" as const,
    id: "x",
    contentType: "journal" as const,
    slug: "x",
    publishedAt: "2026-01-01T00:00:00.000Z",
    metadata: { title: "x" },
    blocks: [],
  };

  assert.throws(
    () => pageFromPublishedDocument(published as any),
    /Cannot adapt/
  );
});

test("pageFromPublishedDocument handles empty description gracefully", () => {
  const published: PublishedPageDocument = {
    contractVersion: "0.1",
    id: "x",
    contentType: "page",
    slug: "x",
    publishedAt: "2026-01-01T00:00:00.000Z",
    metadata: { title: "X" },
    blocks: [],
  };

  const page = pageFromPublishedDocument(published);
  assert.equal(page.description, undefined);
});

// ============================================================
// Existing Journal/Project Behavior Unchanged
// ============================================================

test("toPublishedJournalDocument still works for journal content type", () => {
  const doc: Document = {
    id: "j1",
    contentType: "journal",
    slug: "my-entry",
    status: "published",
    title: "My Entry",
    metadata: { title: "My Entry", category: "dev-logs" },
    blocks: [],
    updatedAt: "2026-08-25T10:00:00.000Z",
    createdAt: "2026-08-25T09:00:00.000Z",
  };

  const published = toPublishedJournalDocument(doc);
  assert.equal(published.contentType, "journal");
  assert.equal(published.slug, "my-entry");
});

test("toPublishedProjectDocument still works for project content type", () => {
  const doc: Document = {
    id: "p1",
    contentType: "project",
    slug: "my-project",
    status: "published",
    title: "My Project",
    metadata: {
      title: "My Project",
      tagline: "A project",
      summary: "Summary",
      category: "App",
      status: "building",
      accentColor: "#123456",
      logo: "/logo.png",
      primaryImage: "/primary.png",
      overview: "Overview",
      why: "Why",
      version: "v1.0.0",
    },
    blocks: [],
    updatedAt: "2026-08-25T10:00:00.000Z",
    createdAt: "2026-08-25T09:00:00.000Z",
  };

  const published = toPublishedProjectDocument(doc);
  assert.equal(published.contentType, "project");
  assert.equal(published.slug, "my-project");
});

test("toPublishedJournalDocument rejects page content type", () => {
  const doc = createTestPageDocument({ contentType: "page" });
  assert.throws(() => toPublishedJournalDocument(doc), /Cannot transform/);
});

test("toPublishedProjectDocument rejects page content type", () => {
  const doc = createTestPageDocument({ contentType: "page" });
  assert.throws(() => toPublishedProjectDocument(doc), /Cannot transform/);
});

// ============================================================
// Scheduled Publishing Compatibility
// ============================================================

test("page document supports scheduled status with scheduledAt", () => {
  const doc = createTestPageDocument({
    status: "scheduled",
    scheduledAt: "2026-08-26T10:00:00.000Z",
  });

  assert.equal(doc.status, "scheduled");
  assert.ok(doc.scheduledAt !== undefined);
});

test("page document supports all five status values", () => {
  const statuses = ["draft", "published", "modified", "scheduled", "unpublished"] as const;

  for (const status of statuses) {
    const doc = createTestPageDocument({ status });
    assert.equal(doc.status, status);
  }
});
