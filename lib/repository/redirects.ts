// Durable V1: Redirect repository

import type { Redirect, ContentType } from "@/lib/domain/document";

interface RedirectRow {
  id: string;
  document_id: string;
  content_type: string;
  old_slug: string;
  new_slug: string;
  created_at: string;
}

function redirectFromRow(row: RedirectRow): Redirect {
  return {
    id: row.id,
    documentId: row.document_id,
    contentType: row.content_type as ContentType,
    oldSlug: row.old_slug,
    newSlug: row.new_slug,
    createdAt: row.created_at,
  };
}

export async function createRedirect(
  db: D1Database,
  redirect: Redirect
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO redirects (id, document_id, content_type, old_slug, new_slug, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      redirect.id,
      redirect.documentId,
      redirect.contentType,
      redirect.oldSlug,
      redirect.newSlug,
      redirect.createdAt
    )
    .run();
}

export async function getRedirectByOldSlug(
  db: D1Database,
  oldSlug: string,
  contentType: ContentType
): Promise<Redirect | undefined> {
  const row = await db
    .prepare("SELECT * FROM redirects WHERE old_slug = ? AND content_type = ?")
    .bind(oldSlug, contentType)
    .first<RedirectRow>();

  return row ? redirectFromRow(row) : undefined;
}

export async function getRedirectsByDocumentId(
  db: D1Database,
  documentId: string
): Promise<Redirect[]> {
  const { results } = await db
    .prepare("SELECT * FROM redirects WHERE document_id = ? ORDER BY created_at DESC")
    .bind(documentId)
    .all<RedirectRow>();

  return (results ?? []).map(redirectFromRow);
}

export async function deleteRedirectsByDocumentId(
  db: D1Database,
  documentId: string
): Promise<void> {
  await db
    .prepare("DELETE FROM redirects WHERE document_id = ?")
    .bind(documentId)
    .run();
}
