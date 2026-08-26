import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDocuments, createDocument } from "@/lib/repository/documents";
import type { Document, ContentType } from "@/lib/domain/document";

// --- Helpers ---

function getDb() {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CONTENT_DB;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const VALID_CONTENT_TYPES: ContentType[] = ["journal", "project", "page"];

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- POST /api/admin/documents ---

export async function POST(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const contentType = body.contentType as string | undefined;
  if (
    !contentType ||
    !VALID_CONTENT_TYPES.includes(contentType as ContentType)
  ) {
    return jsonError(
      `contentType must be one of: ${VALID_CONTENT_TYPES.join(", ")}`,
      400
    );
  }

  const title = typeof body.title === "string" ? body.title : "";
  const slug =
    typeof body.slug === "string" && body.slug.trim() !== ""
      ? body.slug.trim()
      : slugify(title) || generateId();

  const now = new Date().toISOString();
  const id = generateId();

  const document: Document = {
    id,
    contentType: contentType as ContentType,
    slug,
    status: "draft",
    title,
    metadata:
      typeof body.metadata === "object" && body.metadata !== null
        ? (body.metadata as Document["metadata"])
        : {},
    blocks: Array.isArray(body.blocks) ? body.blocks : [],
    updatedAt: now,
    createdAt: now,
  };

  try {
    const db = getDb();
    await createDocument(db, document);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE constraint failed")) {
      return jsonError(
        `A document with slug "${slug}" already exists for ${contentType}.`,
        409
      );
    }
    console.error("Failed to create document:", error);
    return jsonError("Failed to create document", 500);
  }

  return Response.json(document, { status: 201 });
}

// --- GET /api/admin/documents ---

export async function GET(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const contentTypeParam = searchParams.get("contentType");

  let contentType: ContentType | undefined;
  if (contentTypeParam) {
    if (!VALID_CONTENT_TYPES.includes(contentTypeParam as ContentType)) {
      return jsonError(
        `contentType must be one of: ${VALID_CONTENT_TYPES.join(", ")}`,
        400
      );
    }
    contentType = contentTypeParam as ContentType;
  }

  try {
    const db = getDb();
    const documents = await getDocuments(db, contentType);
    return Response.json({ documents });
  } catch (error) {
    console.error("Failed to list documents:", error);
    return jsonError("Failed to list documents", 500);
  }
}
