import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getDocument,
  updateDocument,
  createRevision,
} from "@/lib/repository/documents";
import { publishDocument } from "@/lib/publishing/publish";
import { getSchema } from "@/lib/editor/schemas";
import { validateForPublish } from "@/lib/editor/validation";
import type { Document, DocumentRevision } from "@/lib/domain/document";

function getDb() {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CONTENT_DB;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/");
  const id = segments[segments.length - 2];
  return id && id.length > 0 ? id : null;
}

// ============================================================
// POST /api/admin/documents/[id]/publish
// ============================================================

export async function POST(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const id = getIdFromPathname(new URL(request.url).pathname);
  if (!id) return jsonError("Missing document id", 400);

  try {
    const db = getDb();
    const doc = await getDocument(db, id);

    if (!doc) {
      return jsonError("Document not found", 404);
    }

    // --- Server-side publish validation ---
    // Uses validateForPublish (not validateDocument): checks title, slug format,
    // block types, and validates format of present metadata fields, but does NOT
    // require all metadata fields (the editor validates those incrementally).
    const schema = getSchema(doc.contentType);
    const errors = validateForPublish(
      schema,
      doc.title,
      doc.slug,
      doc.metadata,
      doc.blocks
    );
    if (errors.length > 0) {
      return jsonError(
        `Cannot publish: ${errors.map((e) => e.message).join("; ")}`,
        400
      );
    }

    const result = await publishDocument(db, doc);

    // Re-fetch the updated document to return current state
    const { getDocument: refetch } = await import("@/lib/repository/documents");
    const updated = await refetch(db, id);

    return Response.json({
      document: updated,
      revision: {
        id: result.documentId,
        label: "published",
      },
      redirectCreated: result.redirectCreated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("redirects.content_type")) {
      return jsonError(
        `Slug is already used as a redirect target for another document. ` +
          `Choose a different slug or resolve the existing redirect first.`,
        409
      );
    }
    if (message.includes("already used as a redirect target")) {
      return jsonError(message, 409);
    }
    console.error("Failed to publish document:", error);
    return jsonError("Failed to publish document", 500);
  }
}

// ============================================================
// DELETE /api/admin/documents/[id]/publish (unpublish)
// ============================================================

export async function DELETE(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const id = getIdFromPathname(new URL(request.url).pathname);
  if (!id) return jsonError("Missing document id", 400);

  try {
    const db = getDb();
    const doc = await getDocument(db, id);

    if (!doc) {
      return jsonError("Document not found", 404);
    }

    // Only callable on documents that are currently live or about to go live.
    // draft and already-unpublished documents cannot be unpublished.
    const UNPUBLISHABLE_STATUSES = ["published", "modified", "scheduled"];
    if (!UNPUBLISHABLE_STATUSES.includes(doc.status)) {
      return jsonError(
        `Cannot unpublish a document with status "${doc.status}". ` +
          `Only published, modified, or scheduled documents can be unpublished.`,
        400
      );
    }

    const now = new Date().toISOString();

    // --- Backup revision ---
    // Before clearing published state, snapshot the current published
    // content as a label='backup' revision. This was flagged in Phase 0.5
    // as an explicit application-layer responsibility.
    const backupRevision: DocumentRevision = {
      id: generateId(),
      documentId: doc.id,
      slug: doc.slug,
      title: doc.title,
      metadata: doc.metadata,
      blocks: doc.blocks,
      label: "backup",
      createdAt: now,
    };
    await createRevision(db, backupRevision);

    // --- Update document ---
    // Unpublish field contract (from Phase 0.5):
    //   status        → "unpublished"
    //   publishedAt   → PRESERVED (historical record)
    //   publishedSlug → CLEARED (slug no longer publicly accessible)
    //   scheduledAt   → CLEARED (pending schedule cancelled)
    //   slug          → PRESERVED (editorial slug retained)
    //   title         → PRESERVED
    //   metadata      → PRESERVED
    //   blocks        → PRESERVED
    //
    // No redirect is created. The old slug simply stops resolving.
    const updated: Document = {
      ...doc,
      status: "unpublished",
      publishedSlug: undefined,
      scheduledAt: undefined,
      // publishedAt intentionally preserved (not cleared)
      updatedAt: now,
    };

    await updateDocument(db, updated);

    return Response.json({
      document: updated,
      backupRevision: {
        id: backupRevision.id,
        label: backupRevision.label,
        createdAt: backupRevision.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to unpublish document:", error);
    return jsonError("Failed to unpublish document", 500);
  }
}
