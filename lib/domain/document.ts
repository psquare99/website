// Durable V1: Domain types
// Canonical types for the publishing backend

// --- Content Types ---

export type ContentType = "journal" | "project" | "page";

// --- Document Status ---
//
// Lifecycle:
//   draft → published → modified → published  (edit cycle)
//   draft → scheduled → published             (scheduled publish)
//   published → unpublished                   (manual unpublish)
//   modified → unpublished                    (manual unpublish)
//
// Unpublished field-level contract:
//   status        → "unpublished"
//   publishedAt   → PRESERVED (historical record of when it was last published)
//   publishedSlug → CLEARED (the slug is no longer publicly accessible)
//   scheduledAt   → CLEARED (any pending schedule is cancelled)
//   slug          → PRESERVED (editorial slug is retained for re-publishing)
//   title         → PRESERVED
//   metadata      → PRESERVED
//   blocks        → PRESERVED
//
// No redirect is created when unpublishing. The old slug simply stops resolving.
// A revision with label='backup' should be created from the last published
// revision before unpublishing, so the published content can be restored.

export type DocumentStatus =
  | "draft"
  | "published"
  | "modified"
  | "scheduled"
  | "unpublished";

// --- Document Block ---

export interface DocumentBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

// --- Document Metadata ---

export type MetadataValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export interface DocumentMetadata {
  [key: string]: MetadataValue;
}

// --- Document ---
//
// Title and slug exist in two places:
//
//   1. Top-level columns: document.title, document.slug
//      → These are the SOURCE OF TRUTH.
//      → These are what get returned to callers and used for public routing.
//
//   2. Inside metadata: metadata.title, metadata.slug (if present)
//      → These are editorial/convenience copies.
//      → metadata.title is used by the publishing contract transformation
//        for journal entries (which extract it from metadata).
//      → metadata.slug is a legacy field from the original publishing format
//        where slug was stored inside metadata.
//
// Write path:
//   - On create: top-level title/slug are set from the caller.
//     metadata.title is set to the same value.
//     metadata.slug is set to the same value if present in metadata.
//   - On update: top-level title/slug are always written from the caller.
//     metadata is written as-is (caller manages metadata consistency).
//   - On slug rename: top-level slug changes. A redirect is created from
//     the old slug to the new slug. publishedSlug is updated if the
//     document was published.
//
// Divergence is possible but intentional: metadata is the caller's domain.
// Top-level columns are what the system queries and serves.

export interface Document {
  id: string;
  contentType: ContentType;
  slug: string;
  status: DocumentStatus;
  title: string;
  metadata: DocumentMetadata;
  blocks: DocumentBlock[];
  publishedAt?: string;
  updatedAt: string;
  publishedSlug?: string;
  scheduledAt?: string;
  categoryId?: string;
  createdAt: string;
}

// --- Document Revision ---
//
// Revisions are append-only snapshots. The "current published revision"
// for a document is always fetched by:
//
//   SELECT * FROM document_revisions
//   WHERE document_id = ? AND label = 'published'
//   ORDER BY created_at DESC
//   LIMIT 1
//
// This is unambiguous because:
//   - Only one publish operation runs at a time (serialized by the
//     application layer — there is no concurrent publish path).
//   - Each publish creates exactly one new row with label='published'.
//   - The ORDER BY created_at DESC LIMIT 1 guarantees the latest.
//
// Race condition note: If two publish calls ran concurrently for the
// same document, both could insert label='published' rows. This is
// prevented at the application layer (single-user system, no concurrent
// publish endpoints). The DB does not enforce single-current-published
// via a unique constraint because label alone is not unique per document
// (draft/backup labels also exist).

export type RevisionLabel = "draft" | "published" | "backup";

export interface DocumentRevision {
  id: string;
  documentId: string;
  slug: string;
  title: string;
  metadata: DocumentMetadata;
  blocks: DocumentBlock[];
  label: RevisionLabel;
  createdAt: string;
}

// --- Redirect ---

export interface Redirect {
  id: string;
  documentId: string;
  contentType: ContentType;
  oldSlug: string;
  newSlug: string;
  createdAt: string;
}

// --- Category ---

export interface Category {
  id: string;
  contentType: ContentType;
  name: string;
  slug: string;
  createdAt: string;
}

// --- Media Asset ---

export interface MediaAsset {
  id: string;
  storageKey: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
}
