// Schedule a document for future publishing
// POST /api/admin/documents/[id]/schedule
// Body: { scheduledAt: "2026-08-30T12:00:00Z" }
//
// Transitions: draft → scheduled
// Sets scheduled_at, which triggers the cron to publish at the right time

import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getDocument,
  updateDocument,
} from "@/lib/repository/documents";
import type { Document, DocumentStatus } from "@/lib/domain/document";

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

export async function POST(request: NextRequest) {
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

  const scheduledAt = body.scheduledAt;
  if (typeof scheduledAt !== "string" || !scheduledAt) {
    return jsonError("scheduledAt is required (ISO string)", 400);
  }

  const date = new Date(scheduledAt);
  if (isNaN(date.getTime())) {
    return jsonError("Invalid scheduledAt date", 400);
  }

  if (date <= new Date()) {
    return jsonError("scheduledAt must be in the future", 400);
  }

  try {
    const db = getDb();
    const doc = await getDocument(db, id);

    if (!doc) {
      return jsonError("Document not found", 404);
    }

    // Only draft documents can be scheduled
    if (doc.status !== "draft") {
      return jsonError(
        `Cannot schedule a document with status "${doc.status}". ` +
          `Only draft documents can be scheduled.`,
        400
      );
    }

    // Validate title exists
    if (!doc.title || doc.title.trim() === "") {
      return jsonError(
        "Cannot schedule: title is required.",
        400
      );
    }

    const updated: Document = {
      ...doc,
      status: "scheduled" as DocumentStatus,
      scheduledAt: date.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateDocument(db, updated);

    return Response.json({
      document: updated,
      scheduledFor: date.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("CHECK constraint failed: status")) {
      return jsonError(
        "Invalid status transition for this document",
        400
      );
    }
    console.error("Failed to schedule document:", error);
    return jsonError("Failed to schedule document", 500);
  }
}

// DELETE: cancel a scheduled document (back to draft)
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

    if (doc.status !== "scheduled") {
      return jsonError(
        `Cannot cancel schedule: document has status "${doc.status}".`,
        400
      );
    }

    const updated: Document = {
      ...doc,
      status: "draft",
      scheduledAt: undefined,
      updatedAt: new Date().toISOString(),
    };

    await updateDocument(db, updated);

    return Response.json({ document: updated });
  } catch (error) {
    console.error("Failed to cancel schedule:", error);
    return jsonError("Failed to cancel schedule", 500);
  }
}
