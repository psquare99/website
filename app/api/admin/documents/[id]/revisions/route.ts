// List revisions for a document
// GET /api/admin/documents/[id]/revisions

import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDocument, getRevisions } from "@/lib/repository/documents";

function getDb() {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CONTENT_DB;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function getIdFromPathname(pathname: string): string | null {
  const segments = pathname.split("/");
  const id = segments[segments.length - 2];
  return id && id.length > 0 ? id : null;
}

export async function GET(request: NextRequest) {
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

    const revisions = await getRevisions(db, id);

    return Response.json(revisions);
  } catch (error) {
    console.error("Failed to get revisions:", error);
    return jsonError("Failed to get revisions", 500);
  }
}
