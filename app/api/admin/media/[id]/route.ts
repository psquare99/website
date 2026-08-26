// Delete a media asset (with reference check)
// DELETE /api/admin/media/[id]
//
// Checks if any document references this asset's URL before deleting.
// If referenced, returns 409 with details.

import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getMediaAsset, deleteMediaAsset } from "@/lib/repository/media";

function getDb() {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CONTENT_DB;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function getIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/");
  const id = segments[segments.length - 1];
  return id && id.length > 0 ? id : null;
}

export async function DELETE(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const id = getIdFromPathname(new URL(request.url).pathname);
  if (!id) return jsonError("Missing media id", 400);

  try {
    const db = getDb();
    const asset = await getMediaAsset(db, id);

    if (!asset) {
      return jsonError("Media asset not found", 404);
    }

    // Reference check: search all documents and revisions for this URL.
    // Checks both blocks (content) and metadata (image fields like logo,
    // primaryImage, indexImage) across live documents and revision snapshots.
    // Uses INSTR() instead of LIKE to avoid D1's LIKE pattern complexity limit.
    const url = asset.publicUrl;
    const references: { id: string; title: string; slug: string; contentType: string; source: string }[] = [];

    // 1. Live documents — blocks
    const { results: docBlockRefs } = await db
      .prepare(
        "SELECT id, title, slug, content_type FROM documents WHERE INSTR(blocks, ?) > 0"
      )
      .bind(url)
      .all<{ id: string; title: string; slug: string; content_type: string }>();
    if (docBlockRefs) {
      for (const r of docBlockRefs) {
        references.push({ id: r.id, title: r.title, slug: r.slug, contentType: r.content_type, source: "document.blocks" });
      }
    }

    // 2. Live documents — metadata (covers logo, primaryImage, indexImage, etc.)
    const { results: docMetaRefs } = await db
      .prepare(
        "SELECT id, title, slug, content_type FROM documents WHERE INSTR(metadata, ?) > 0"
      )
      .bind(url)
      .all<{ id: string; title: string; slug: string; content_type: string }>();
    if (docMetaRefs) {
      for (const r of docMetaRefs) {
        // Deduplicate — may overlap with blocks check
        if (!references.some((ref) => ref.id === r.id && ref.source === "document.metadata")) {
          references.push({ id: r.id, title: r.title, slug: r.slug, contentType: r.content_type, source: "document.metadata" });
        }
      }
    }

    // 3. Revision snapshots — blocks
    const { results: revBlockRefs } = await db
      .prepare(
        "SELECT DISTINCT r.document_id as id, d.title, d.slug, d.content_type FROM document_revisions r JOIN documents d ON r.document_id = d.id WHERE INSTR(r.blocks, ?) > 0"
      )
      .bind(url)
      .all<{ id: string; title: string; slug: string; content_type: string }>();
    if (revBlockRefs) {
      for (const r of revBlockRefs) {
        if (!references.some((ref) => ref.id === r.id && ref.source === "revision.blocks")) {
          references.push({ id: r.id, title: r.title, slug: r.slug, contentType: r.content_type, source: "revision.blocks" });
        }
      }
    }

    // 4. Revision snapshots — metadata
    const { results: revMetaRefs } = await db
      .prepare(
        "SELECT DISTINCT r.document_id as id, d.title, d.slug, d.content_type FROM document_revisions r JOIN documents d ON r.document_id = d.id WHERE INSTR(r.metadata, ?) > 0"
      )
      .bind(url)
      .all<{ id: string; title: string; slug: string; content_type: string }>();
    if (revMetaRefs) {
      for (const r of revMetaRefs) {
        if (!references.some((ref) => ref.id === r.id && ref.source === "revision.metadata")) {
          references.push({ id: r.id, title: r.title, slug: r.slug, contentType: r.content_type, source: "revision.metadata" });
        }
      }
    }

    if (references.length > 0) {
      return Response.json(
        {
          error: `Cannot delete: ${references.length} document reference(s) to this image.`,
          references: references.map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            contentType: r.contentType,
            source: r.source,
          })),
        },
        { status: 409 }
      );
    }

    // Delete from R2
    const { env } = getCloudflareContext();
    const bucket = (env as CloudflareEnv).MEDIA_BUCKET;
    try {
      await bucket.delete(asset.storageKey);
    } catch {
      // R2 delete failure is non-fatal — the D1 record is the source of truth
      console.warn(`Failed to delete R2 object: ${asset.storageKey}`);
    }

    // Delete from D1
    await deleteMediaAsset(db, id);

    return Response.json({ deleted: true, id });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return jsonError("Failed to delete media", 500);
  }
}
