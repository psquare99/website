// Restore a document to a specific revision
// POST /api/admin/documents/[id]/revisions/[revisionId]/restore
//
// Creates a new draft with the revision's content.
// Does NOT modify the revision history — this is an append-only operation.

import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getDocument,
  getRevisions,
  updateDocument,
  createRevision,
} from "@/lib/repository/documents";
import { getRedirectByOldSlug } from "@/lib/repository/redirects";
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

function getIdFromPathname(pathname: string): { docId: string; revisionId: string } | null {
  const segments = pathname.split("/");
  // .../documents/[id]/revisions/[revisionId]/restore
  const revisionId = segments[segments.length - 2];
  const docId = segments[segments.length - 4];
  if (!docId || !revisionId) return null;
  return { docId, revisionId };
}

export async function POST(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const ids = getIdFromPathname(new URL(request.url).pathname);
  if (!ids) return jsonError("Missing document or revision id", 400);

  try {
    const db = getDb();
    const doc = await getDocument(db, ids.docId);

    if (!doc) {
      return jsonError("Document not found", 404);
    }

    // Only draft or unpublished documents can be restored to
    if (doc.status !== "draft" && doc.status !== "unpublished") {
      return jsonError(
        `Cannot restore: document has status "${doc.status}". ` +
          `Unpublish first, then restore.`,
        400
      );
    }

    const revisions = await getRevisions(db, ids.docId);
    const revision = revisions.find((r) => r.id === ids.revisionId);

    if (!revision) {
      return jsonError("Revision not found", 404);
    }

    // Snapshot current state as a "backup" revision before restoring
    const backupRevision: DocumentRevision = {
      id: generateId(),
      documentId: doc.id,
      slug: doc.slug,
      title: doc.title,
      metadata: doc.metadata,
      blocks: doc.blocks,
      label: "backup",
      createdAt: new Date().toISOString(),
    };
    await createRevision(db, backupRevision);

    // Restore content from the selected revision
    const now = new Date().toISOString();

    // Slug conflict check: if the restored slug is already used as an
    // old_slug in a redirect belonging to a different document, reject.
    // This prevents restoring a slug that would silently shadow an
    // existing redirect.
    if (revision.slug !== doc.slug) {
      const existingRedirect = await getRedirectByOldSlug(
        db,
        revision.slug,
        doc.contentType
      );
      if (existingRedirect && existingRedirect.documentId !== doc.id) {
        return jsonError(
          `Cannot restore: slug "${revision.slug}" is already used as a redirect target ` +
            `for another document. Choose a different slug first.`,
          409
        );
      }
    }

    const updated: Document = {
      ...doc,
      slug: revision.slug,
      title: revision.title,
      metadata: revision.metadata,
      blocks: revision.blocks,
      updatedAt: now,
    };

    await updateDocument(db, updated);

    return Response.json({
      document: updated,
      restoredFrom: {
        id: revision.id,
        label: revision.label,
        createdAt: revision.createdAt,
      },
      backupRevision: {
        id: backupRevision.id,
        label: backupRevision.label,
        createdAt: backupRevision.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to restore revision:", error);
    return jsonError("Failed to restore revision", 500);
  }
}
