import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/repository/documents";
import { getSchema } from "@/lib/editor/schemas";
import type {
  Document,
  DocumentStatus,
} from "@/lib/domain/document";

// --- Helpers ---

function getDb() {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CONTENT_DB;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const DELETABLE_STATUSES: DocumentStatus[] = ["draft", "unpublished"];

function getIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/");
  const id = segments[segments.length - 1];
  return id && id.length > 0 ? id : null;
}

// --- GET /api/admin/documents/[id] ---

export async function GET(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const id = getIdFromPathname(new URL(request.url).pathname);
  if (!id) return jsonError("Missing document id", 400);

  try {
    const db = getDb();
    const document = await getDocument(db, id);

    if (!document) {
      return jsonError("Document not found", 404);
    }

    return Response.json(document);
  } catch (error) {
    console.error("Failed to get document:", error);
    return jsonError("Failed to get document", 500);
  }
}

// --- PUT /api/admin/documents/[id] ---

export async function PUT(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const id = getIdFromPathname(new URL(request.url).pathname);
  if (!id) return jsonError("Missing document id", 400);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  let existing: Document | undefined;

  try {
    const db = getDb();
    existing = await getDocument(db, id);

    if (!existing) {
      return jsonError("Document not found", 404);
    }

    // --- Status transition rules ---
    //
    // Safety guarantee: editing a published document must never change
    // what the public sees. The public renderer serves the last
    // label='published' revision. Changing the document's status to
    // 'modified' ensures the public version is frozen until re-publish.
    //
    // draft     → draft     (stays draft, no published version to protect)
    // published → modified  (freezes public version, must re-publish)
    // modified  → modified  (already modified, stays modified)
    // scheduled → draft     (no revision exists yet to protect; schedule
    //                        may need updating with new content)
    // unpublished → unpublished (don't resurrect; must re-publish explicitly)
    let newStatus: DocumentStatus = existing.status;

    switch (existing.status) {
      case "draft":
        newStatus = "draft";
        break;
      case "published":
        newStatus = "modified";
        break;
      case "modified":
        newStatus = "modified";
        break;
      case "scheduled":
        newStatus = "draft";
        break;
      case "unpublished":
        newStatus = "unpublished";
        break;
    }

    // Build updated document — caller's fields overwrite, existing fields preserved
    const slug =
      typeof body.slug === "string" && body.slug.trim() !== ""
        ? body.slug.trim()
        : existing.slug;
    const title =
      typeof body.title === "string" ? body.title : existing.title;

    // --- Lightweight server-side save validation ---
    // Validates structural integrity without requiring all metadata fields.
    // The editor validates metadata incrementally; this catches malformed data.
    if (body.slug != null) {
      if (typeof body.slug !== "string" || body.slug.trim() === "") {
        return jsonError("Slug must be a non-empty string", 400);
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug.trim())) {
        return jsonError(
          "Slug must contain only lowercase letters, numbers, and hyphens",
          400
        );
      }
    }

    if (Array.isArray(body.blocks)) {
      const schema = getSchema(existing.contentType);
      for (const block of body.blocks) {
        if (
          typeof block !== "object" ||
          block === null ||
          !schema.allowedBlockTypes.includes(block.type)
        ) {
          return jsonError(
            `Invalid block type: ${typeof block === "object" && block !== null ? block.type : "unknown"}`,
            400
          );
        }
      }
    }

    const updated: Document = {
      ...existing,
      slug,
      title,
      status: newStatus,
      metadata:
        typeof body.metadata === "object" && body.metadata !== null
          ? (body.metadata as Document["metadata"])
          : existing.metadata,
      blocks: Array.isArray(body.blocks) ? body.blocks : existing.blocks,
      updatedAt: new Date().toISOString(),
      // Preserve publishing fields — this route never touches them.
      // published_at, published_slug, and scheduled_at are managed only
      // by publish/unpublish/schedule operations (future phases).
      publishedAt: existing.publishedAt,
      publishedSlug: existing.publishedSlug,
      scheduledAt:
        newStatus === "draft" && existing.status === "scheduled"
          ? undefined
          : existing.scheduledAt,
      categoryId:
        "categoryId" in body
          ? (body.categoryId as string | undefined)
          : existing.categoryId,
    };

    await updateDocument(db, updated);

    return Response.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE constraint failed")) {
      return jsonError(
        `A document with slug "${body.slug}" already exists for ${existing?.contentType}.`,
        409
      );
    }
    if (message.includes("CHECK constraint failed: status")) {
      return jsonError(
        "Invalid status transition for this document",
        400
      );
    }
    console.error("Failed to update document:", error);
    return jsonError("Failed to update document", 500);
  }
}

// --- DELETE /api/admin/documents/[id] ---

export async function DELETE(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const id = getIdFromPathname(new URL(request.url).pathname);
  if (!id) return jsonError("Missing document id", 400);

  try {
    const db = getDb();
    const existing = await getDocument(db, id);

    if (!existing) {
      return jsonError("Document not found", 404);
    }

    // Safety: reject deletion of live content.
    // There is no unpublish route in this phase — deleting a currently-public
    // document would break readers. Only draft and unpublished documents
    // may be deleted. Published/modified/scheduled documents must be
    // explicitly unpublished first (future phase).
    if (!DELETABLE_STATUSES.includes(existing.status)) {
      return jsonError(
        `Cannot delete a document with status "${existing.status}". ` +
          `Only draft or unpublished documents can be deleted. ` +
          `Unpublish this document first.`,
        400
      );
    }

    // Revisions and redirects cascade-delete via ON DELETE CASCADE
    // in the D1 schema (document_revisions.document_id and
    // redirects.document_id both reference documents(id) ON DELETE CASCADE).
    await deleteDocument(db, id);

    return Response.json({ deleted: true, id });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return jsonError("Failed to delete document", 500);
  }
}
