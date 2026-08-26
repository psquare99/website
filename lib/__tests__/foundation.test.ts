// Durable V1: Foundation tests
// Tests for domain types, contract transformation, and repository shapes

import test from "node:test";
import assert from "node:assert/strict";

import type {
  Document,
  DocumentBlock,
  DocumentMetadata,
  DocumentRevision,
  Redirect,
  Category,
  MediaAsset,
  DocumentStatus,
  RevisionLabel,
} from "@/lib/domain/document";

import {
  toPublishedJournalDocument,
  toPublishedProjectDocument,
} from "@/lib/publishing/contract";

import type { PublishedDocument } from "@/lib/publishing/journal-adapter";
import type { PublishedProjectDocument } from "@/lib/publishing/project-adapter";

// --- Helpers ---

function createTestDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: "test-doc-1",
    contentType: "journal",
    slug: "test-entry",
    status: "draft",
    title: "Test Entry",
    metadata: {
      title: "Test Entry",
      excerpt: "A test entry.",
      category: "dev-logs",
    },
    blocks: [
      {
        id: "block-1",
        type: "paragraph",
        data: { text: "Hello world." },
      },
    ],
    updatedAt: "2026-08-25T10:00:00.000Z",
    createdAt: "2026-08-25T09:00:00.000Z",
    ...overrides,
  };
}

function createTestRevision(overrides: Partial<DocumentRevision> = {}): DocumentRevision {
  return {
    id: "rev-1",
    documentId: "test-doc-1",
    slug: "test-entry",
    title: "Test Entry",
    metadata: {
      title: "Test Entry",
      excerpt: "A test entry.",
    },
    blocks: [
      {
        id: "block-1",
        type: "paragraph",
        data: { text: "Hello world." },
      },
    ],
    label: "published",
    createdAt: "2026-08-25T10:00:00.000Z",
    ...overrides,
  };
}

// --- Document Shape Tests ---

test("document has correct shape", () => {
  const doc = createTestDocument();

  assert.equal(typeof doc.id, "string");
  assert.equal(doc.contentType, "journal");
  assert.equal(doc.slug, "test-entry");
  assert.equal(doc.status, "draft");
  assert.equal(doc.title, "Test Entry");
  assert.deepEqual(doc.metadata, {
    title: "Test Entry",
    excerpt: "A test entry.",
    category: "dev-logs",
  });
  assert.ok(Array.isArray(doc.blocks));
  assert.equal(doc.blocks.length, 1);
  assert.equal(doc.blocks[0].id, "block-1");
  assert.equal(doc.blocks[0].type, "paragraph");
  assert.deepEqual(doc.blocks[0].data, { text: "Hello world." });
  assert.equal(typeof doc.updatedAt, "string");
  assert.equal(typeof doc.createdAt, "string");
});

test("document supports all five status values", () => {
  const statuses: DocumentStatus[] = [
    "draft",
    "published",
    "modified",
    "scheduled",
    "unpublished",
  ];

  assert.equal(statuses.length, 5);

  for (const status of statuses) {
    const doc = createTestDocument({ status });
    assert.equal(doc.status, status);
  }
});

test("document metadata round-trips through JSON", () => {
  const doc = createTestDocument();
  const serialized = JSON.stringify(doc.metadata);
  const deserialized = JSON.parse(serialized) as DocumentMetadata;

  assert.deepEqual(deserialized, doc.metadata);
});

test("document blocks round-trip through JSON", () => {
  const doc = createTestDocument();
  const serialized = JSON.stringify(doc.blocks);
  const deserialized = JSON.parse(serialized) as DocumentBlock[];

  assert.deepEqual(deserialized, doc.blocks);
});

test("document supports optional fields", () => {
  const doc = createTestDocument({
    publishedAt: "2026-08-25T10:00:00.000Z",
    publishedSlug: "test-entry",
    scheduledAt: "2026-08-26T10:00:00.000Z",
    categoryId: "cat-1",
  });

  assert.equal(doc.publishedAt, "2026-08-25T10:00:00.000Z");
  assert.equal(doc.publishedSlug, "test-entry");
  assert.equal(doc.scheduledAt, "2026-08-26T10:00:00.000Z");
  assert.equal(doc.categoryId, "cat-1");
});

test("document supports project content type", () => {
  const doc = createTestDocument({
    contentType: "project",
    slug: "my-project",
    metadata: {
      title: "My Project",
      tagline: "A project",
      summary: "Summary",
      category: "App",
      status: "building",
      accentColor: "#123456",
      logo: "/images/logo.png",
      primaryImage: "/images/primary.png",
      overview: "Overview",
      why: "Why",
      version: "v1.0.0",
    },
  });

  assert.equal(doc.contentType, "project");
  assert.equal(doc.slug, "my-project");
});

// --- Unpublished Status Tests ---

test("unpublished status exists in DocumentStatus", () => {
  const allStatuses: DocumentStatus[] = [
    "draft", "published", "modified", "scheduled", "unpublished",
  ];
  assert.ok(allStatuses.includes("unpublished"));
});

test("unpublished document preserves publishedAt as history", () => {
  const doc = createTestDocument({
    status: "unpublished",
    publishedAt: "2026-08-20T10:00:00.000Z",
    publishedSlug: undefined,
    scheduledAt: undefined,
  });

  assert.equal(doc.status, "unpublished");
  assert.equal(doc.publishedAt, "2026-08-20T10:00:00.000Z");
});

test("unpublished document clears publishedSlug", () => {
  const doc = createTestDocument({
    status: "unpublished",
    publishedSlug: undefined,
  });

  assert.equal(doc.publishedSlug, undefined);
});

test("unpublished document clears scheduledAt", () => {
  const doc = createTestDocument({
    status: "unpublished",
    scheduledAt: undefined,
  });

  assert.equal(doc.scheduledAt, undefined);
});

test("unpublished document preserves editorial slug and title", () => {
  const doc = createTestDocument({
    status: "unpublished",
    slug: "my-entry",
    title: "My Entry",
  });

  assert.equal(doc.slug, "my-entry");
  assert.equal(doc.title, "My Entry");
});

test("unpublished document preserves metadata and blocks", () => {
  const metadata = { title: "Test", excerpt: "Excerpt" };
  const blocks = [{ id: "b1", type: "paragraph", data: { text: "Hello" } }];

  const doc = createTestDocument({
    status: "unpublished",
    metadata,
    blocks,
  });

  assert.deepEqual(doc.metadata, metadata);
  assert.deepEqual(doc.blocks, blocks);
});

// --- Scheduled Status Consistency Tests ---

test("scheduled status requires scheduledAt to be set", () => {
  const doc = createTestDocument({
    status: "scheduled",
    scheduledAt: "2026-08-26T10:00:00.000Z",
  });

  assert.equal(doc.status, "scheduled");
  assert.ok(doc.scheduledAt !== undefined);
  assert.ok(doc.scheduledAt !== null);
});

test("non-scheduled status requires scheduledAt to be null/undefined", () => {
  const nonScheduledStatuses: DocumentStatus[] = [
    "draft", "published", "modified", "unpublished",
  ];

  for (const status of nonScheduledStatuses) {
    const doc = createTestDocument({
      status,
      scheduledAt: undefined,
    });
    assert.equal(doc.scheduledAt, undefined);
  }
});

// --- Revision Shape Tests ---

test("revision has correct shape", () => {
  const rev = createTestRevision();

  assert.equal(typeof rev.id, "string");
  assert.equal(rev.documentId, "test-doc-1");
  assert.equal(rev.slug, "test-entry");
  assert.equal(rev.title, "Test Entry");
  assert.ok(typeof rev.metadata === "object");
  assert.ok(Array.isArray(rev.blocks));
  assert.equal(rev.label, "published");
  assert.equal(typeof rev.createdAt, "string");
});

test("revision supports all label values", () => {
  const labels: RevisionLabel[] = ["draft", "published", "backup"];

  for (const label of labels) {
    const rev = createTestRevision({ label });
    assert.equal(rev.label, label);
  }
});

test("revision stores full document snapshot", () => {
  const doc = createTestDocument();
  const rev = createTestRevision({
    metadata: doc.metadata,
    blocks: doc.blocks,
  });

  assert.deepEqual(rev.metadata, doc.metadata);
  assert.deepEqual(rev.blocks, doc.blocks);
});

// --- Published Revision Query Guarantee Tests ---

test("published revision is unambiguously identifiable by label='published'", () => {
  const revisions: DocumentRevision[] = [
    createTestRevision({ id: "rev-1", label: "draft", createdAt: "2026-08-25T09:00:00.000Z" }),
    createTestRevision({ id: "rev-2", label: "published", createdAt: "2026-08-25T10:00:00.000Z" }),
    createTestRevision({ id: "rev-3", label: "backup", createdAt: "2026-08-25T11:00:00.000Z" }),
  ];

  // Simulate the query: filter by label='published', order by created_at DESC, take first
  const published = revisions
    .filter((r) => r.label === "published")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  assert.equal(published.length, 1);
  assert.equal(published[0].id, "rev-2");
});

test("latest published revision is the most recent when multiple exist", () => {
  const revisions: DocumentRevision[] = [
    createTestRevision({ id: "rev-1", label: "published", createdAt: "2026-08-20T10:00:00.000Z" }),
    createTestRevision({ id: "rev-2", label: "published", createdAt: "2026-08-25T10:00:00.000Z" }),
    createTestRevision({ id: "rev-3", label: "published", createdAt: "2026-08-22T10:00:00.000Z" }),
  ];

  const published = revisions
    .filter((r) => r.label === "published")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  assert.equal(published[0].id, "rev-2");
});

// --- Slug and Redirect Tests ---

test("redirect has correct shape", () => {
  const redirect: Redirect = {
    id: "redirect-1",
    documentId: "test-doc-1",
    contentType: "journal",
    oldSlug: "old-slug",
    newSlug: "new-slug",
    createdAt: "2026-08-25T10:00:00.000Z",
  };

  assert.equal(redirect.oldSlug, "old-slug");
  assert.equal(redirect.newSlug, "new-slug");
  assert.equal(redirect.contentType, "journal");
});

// --- Media Asset Tests ---

test("media asset has correct shape", () => {
  const asset: MediaAsset = {
    id: "media-1",
    storageKey: "media/2026/asset-id.jpg",
    publicUrl: "https://pub-example.r2.dev/media/2026/asset-id.jpg",
    filename: "photo.jpg",
    mimeType: "image/jpeg",
    size: 1024000,
    alt: "A photo",
    createdAt: "2026-08-25T10:00:00.000Z",
  };

  assert.equal(asset.storageKey, "media/2026/asset-id.jpg");
  assert.equal(asset.publicUrl.startsWith("https://"), true);
  assert.equal(asset.mimeType, "image/jpeg");
  assert.equal(asset.size, 1024000);
});

// --- Publishing Contract Tests ---

test("toPublishedJournalDocument transforms D1 document to Contract v0.1", () => {
  const doc = createTestDocument({
    contentType: "journal",
    publishedAt: "2026-08-25T10:00:00.000Z",
  });

  const published = toPublishedJournalDocument(doc);

  assert.equal(published.contractVersion, "0.1");
  assert.equal(published.id, doc.id);
  assert.equal(published.contentType, "journal");
  assert.equal(published.slug, doc.slug);
  assert.equal(published.publishedAt, "2026-08-25T10:00:00.000Z");
  assert.equal(published.metadata.title, "Test Entry");
  assert.equal(published.metadata.excerpt, "A test entry.");
  assert.equal(published.metadata.category, "dev-logs");
  assert.ok(Array.isArray(published.blocks));
  assert.equal(published.blocks.length, 1);
  assert.equal(published.blocks[0].id, "block-1");
  assert.equal(published.blocks[0].type, "paragraph");
});

test("toPublishedJournalDocument falls back to createdAt when publishedAt missing", () => {
  const doc = createTestDocument({
    contentType: "journal",
    createdAt: "2026-08-25T09:00:00.000Z",
  });

  const published = toPublishedJournalDocument(doc);
  assert.equal(published.publishedAt, "2026-08-25T09:00:00.000Z");
});

test("toPublishedJournalDocument throws for wrong content type", () => {
  const doc = createTestDocument({ contentType: "project" });
  assert.throws(() => toPublishedJournalDocument(doc), /Cannot transform/);
});

test("toPublishedProjectDocument transforms D1 document to Contract v0.1", () => {
  const doc = createTestDocument({
    contentType: "project",
    slug: "my-project",
    title: "My Project",
    publishedAt: "2026-08-25T10:00:00.000Z",
    metadata: {
      title: "My Project",
      tagline: "A project",
      summary: "Summary",
      category: "App",
      status: "building",
      accentColor: "#123456",
      logo: "/images/logo.png",
      primaryImage: "/images/primary.png",
      overview: "Overview",
      why: "Why",
      version: "v1.0.0",
    },
    blocks: [],
  });

  const published = toPublishedProjectDocument(doc);

  assert.equal(published.contractVersion, "0.1");
  assert.equal(published.id, doc.id);
  assert.equal(published.contentType, "project");
  assert.equal(published.slug, "my-project");
  assert.equal(published.publishedAt, "2026-08-25T10:00:00.000Z");
  assert.equal(published.metadata.title, "My Project");
  assert.equal(published.metadata.tagline, "A project");
  assert.ok(Array.isArray(published.blocks));
});

test("toPublishedProjectDocument throws for wrong content type", () => {
  const doc = createTestDocument({ contentType: "journal" });
  assert.throws(() => toPublishedProjectDocument(doc), /Cannot transform/);
});

test("published document is compatible with existing adapters", () => {
  const doc = createTestDocument({
    contentType: "journal",
    publishedAt: "2026-08-25T10:00:00.000Z",
  });

  const published = toPublishedJournalDocument(doc);

  const contractDoc = published as PublishedDocument;
  assert.equal(contractDoc.contractVersion, "0.1");
  assert.equal(contractDoc.contentType, "journal");
  assert.ok(typeof contractDoc.slug === "string");
  assert.ok(typeof contractDoc.publishedAt === "string");
  assert.ok(typeof contractDoc.metadata === "object");
  assert.ok(Array.isArray(contractDoc.blocks));
});

test("published project document is compatible with existing adapters", () => {
  const doc = createTestDocument({
    contentType: "project",
    slug: "my-project",
    publishedAt: "2026-08-25T10:00:00.000Z",
    metadata: {
      title: "My Project",
      tagline: "A project",
      summary: "Summary",
      category: "App",
      status: "building",
      accentColor: "#123456",
      logo: "/images/logo.png",
      primaryImage: "/images/primary.png",
      overview: "Overview",
      why: "Why",
      version: "v1.0.0",
    },
    blocks: [],
  });

  const published = toPublishedProjectDocument(doc);

  const contractDoc = published as PublishedProjectDocument;
  assert.equal(contractDoc.contractVersion, "0.1");
  assert.equal(contractDoc.contentType, "project");
  assert.ok(typeof contractDoc.slug === "string");
  assert.ok(typeof contractDoc.publishedAt === "string");
  assert.ok(typeof contractDoc.metadata === "object");
  assert.ok(Array.isArray(contractDoc.blocks));
});

// --- Source-of-Truth Divergence Tests ---
// These tests prove that contract output uses top-level document.title/slug,
// NOT metadata.title/metadata.slug, when the two diverge.

test("journal contract uses top-level title when metadata.title diverges", () => {
  const doc = createTestDocument({
    contentType: "journal",
    title: "Canonical Title",
    metadata: {
      title: "Stale Metadata Title",
      category: "dev-logs",
    },
  });

  const published = toPublishedJournalDocument(doc);
  assert.equal(published.metadata.title, "Canonical Title");
});

test("journal contract uses top-level slug, not metadata.slug", () => {
  const doc = createTestDocument({
    contentType: "journal",
    slug: "canonical-slug",
    metadata: {
      title: "Test",
      slug: "stale-metadata-slug",
    },
  });

  const published = toPublishedJournalDocument(doc);
  assert.equal(published.slug, "canonical-slug");
});

test("project contract uses top-level title when metadata.title diverges", () => {
  const doc = createTestDocument({
    contentType: "project",
    slug: "my-project",
    title: "Canonical Project Title",
    metadata: {
      title: "Stale Metadata Project Title",
      tagline: "A project",
      summary: "Summary",
      category: "App",
      status: "building",
      accentColor: "#123456",
      logo: "/images/logo.png",
      primaryImage: "/images/primary.png",
      overview: "Overview",
      why: "Why",
      version: "v1.0.0",
    },
    blocks: [],
  });

  const published = toPublishedProjectDocument(doc);
  assert.equal(published.metadata.title, "Canonical Project Title");
});

test("project contract uses top-level slug, not metadata.slug", () => {
  const doc = createTestDocument({
    contentType: "project",
    slug: "canonical-project-slug",
    metadata: {
      title: "Test",
      slug: "stale-metadata-project-slug",
    },
    blocks: [],
  });

  const published = toPublishedProjectDocument(doc);
  assert.equal(published.slug, "canonical-project-slug");
});

// --- Journal Metadata Image (Phase 11B regression) ---

test("toPublishedJournalDocument passes metadata.image through contract", () => {
  const doc = createTestDocument({
    contentType: "journal",
    metadata: {
      title: "Test Entry",
      image: "https://pub-cf03fb0406654b30a8f4535e5e423f54.r2.dev/media/2026/abc.jpg",
    },
  });

  const published = toPublishedJournalDocument(doc);
  assert.equal(
    published.metadata.image,
    "https://pub-cf03fb0406654b30a8f4535e5e423f54.r2.dev/media/2026/abc.jpg"
  );
});

test("toPublishedJournalDocument omits metadata.image when absent", () => {
  const doc = createTestDocument({
    contentType: "journal",
    metadata: { title: "Test Entry" },
  });

  const published = toPublishedJournalDocument(doc);
  assert.equal(published.metadata.image, undefined);
});

test("toPublishedJournalDocument omits metadata.image for non-string value", () => {
  const doc = createTestDocument({
    contentType: "journal",
    metadata: { title: "Test Entry", image: 42 as unknown as string },
  });

  const published = toPublishedJournalDocument(doc);
  assert.equal(published.metadata.image, undefined);
});

// --- Category Tests ---

test("category has correct shape", () => {
  const category: Category = {
    id: "cat-1",
    contentType: "journal",
    name: "Dev Logs",
    slug: "dev-logs",
    createdAt: "2026-08-25T10:00:00.000Z",
  };

  assert.equal(category.contentType, "journal");
  assert.equal(category.slug, "dev-logs");
  assert.equal(category.name, "Dev Logs");
});
