// Shared publish function — the single source of truth for what "publish" means.
// Called by both the manual POST /publish route and the cron scheduler.
// Every field mutation is defined here exactly once.
//
// NOTE ON NON-ATOMICITY: This function performs multiple sequential D1 writes
// (createRevision, getRedirectByOldSlug, createRedirect, updateDocument) that
// are NOT wrapped in a D1 transaction. D1 auto-commits each statement. If a
// failure occurs mid-way (e.g., after revision creation but before document
// update), an orphaned published revision may exist. This is harmless noise:
// the revision is append-only, the document state is still consistent, and
// the next publish will create a correct revision. A D1 transaction would
// add complexity without meaningful benefit for this single-user system.

import type {
  Document,
  DocumentRevision,
} from "@/lib/domain/document";
import {
  updateDocument,
  createRevision,
} from "@/lib/repository/documents";
import {
  createRedirect,
  getRedirectByOldSlug,
} from "@/lib/repository/redirects";

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface PublishResult {
  documentId: string;
  slug: string;
  title: string;
  publishedAt: string;
  redirectCreated: { from: string; to: string } | null;
}

/**
 * Publish a document. This is the single implementation of the publish contract.
 *
 * Contract:
 * 1. Create a label='published' revision (append-only snapshot).
 * 2. Set publishedAt: first publish sets it, republish preserves it.
 * 3. Slug conflict check: reject if the slug is already used as an old_slug
 *    in a redirect belonging to a different document.
 * 4. If slug changed from previous publishedSlug, create a redirect.
 * 5. Update document: status='published', publishedSlug=slug,
 *    scheduledAt=undefined (clear any pending schedule).
 *
 * This function does NOT validate the document (title, slug format, metadata).
 * Validation is the caller's responsibility — the manual route validates before
 * calling; the scheduler trusts that scheduled documents passed validation at
 * schedule time.
 *
 * Throws on slug conflict or database error. The caller is responsible for
 * error handling and response formatting.
 */
export async function publishDocument(
  db: D1Database,
  doc: Document
): Promise<PublishResult> {
  const now = new Date().toISOString();

  // --- Revision snapshot ---
  const revision: DocumentRevision = {
    id: generateId(),
    documentId: doc.id,
    slug: doc.slug,
    title: doc.title,
    metadata: doc.metadata,
    blocks: doc.blocks,
    label: "published",
    createdAt: now,
  };
  await createRevision(db, revision);

  // --- published_at ---
  // Set once on first publish, preserved on every republish.
  const publishedAt = doc.publishedAt ?? now;

  // --- Slug conflict check ---
  const existingRedirect = await getRedirectByOldSlug(
    db,
    doc.slug,
    doc.contentType
  );
  if (existingRedirect && existingRedirect.documentId !== doc.id) {
    throw new Error(
      `Slug "${doc.slug}" is already used as a redirect target for document ${existingRedirect.documentId}. ` +
        `Choose a different slug or resolve the existing redirect first.`
    );
  }

  // --- published_slug & redirect ---
  const previousPublishedSlug = doc.publishedSlug;
  const slugChanged =
    previousPublishedSlug != null && previousPublishedSlug !== doc.slug;

  let redirectCreated: { from: string; to: string } | null = null;

  if (slugChanged) {
    await createRedirect(db, {
      id: generateId(),
      documentId: doc.id,
      contentType: doc.contentType,
      oldSlug: previousPublishedSlug,
      newSlug: doc.slug,
      createdAt: now,
    });
    redirectCreated = { from: previousPublishedSlug, to: doc.slug };
  }

  // --- Update document ---
  const updated: Document = {
    ...doc,
    status: "published",
    publishedAt,
    publishedSlug: doc.slug,
    scheduledAt: undefined,
    updatedAt: now,
  };

  await updateDocument(db, updated);

  return {
    documentId: doc.id,
    slug: doc.slug,
    title: doc.title,
    publishedAt,
    redirectCreated,
  };
}
