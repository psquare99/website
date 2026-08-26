// Durable V1: Document repository
// Direct D1 prepared statements, no ORM

import type {
  Document,
  DocumentBlock,
  DocumentMetadata,
  DocumentRevision,
  DocumentStatus,
  ContentType,
  RevisionLabel,
} from "@/lib/domain/document";

// --- Row Types ---

interface DocumentRow {
  id: string;
  content_type: string;
  slug: string;
  status: string;
  title: string;
  metadata: string;
  blocks: string;
  published_at: string | null;
  updated_at: string;
  published_slug: string | null;
  scheduled_at: string | null;
  category_id: string | null;
  created_at: string;
}

interface RevisionRow {
  id: string;
  document_id: string;
  slug: string;
  title: string;
  metadata: string;
  blocks: string;
  label: string;
  created_at: string;
}

// --- Mappers ---

function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function documentFromRow(row: DocumentRow): Document {
  return {
    id: row.id,
    contentType: row.content_type as ContentType,
    slug: row.slug,
    status: row.status as DocumentStatus,
    title: row.title,
    metadata: safeJsonParse(row.metadata, {}) as DocumentMetadata,
    blocks: safeJsonParse(row.blocks, []) as DocumentBlock[],
    publishedAt: row.published_at ?? undefined,
    updatedAt: row.updated_at,
    publishedSlug: row.published_slug ?? undefined,
    scheduledAt: row.scheduled_at ?? undefined,
    categoryId: row.category_id ?? undefined,
    createdAt: row.created_at,
  };
}

function revisionFromRow(row: RevisionRow): DocumentRevision {
  return {
    id: row.id,
    documentId: row.document_id,
    slug: row.slug,
    title: row.title,
    metadata: safeJsonParse(row.metadata, {}) as DocumentMetadata,
    blocks: safeJsonParse(row.blocks, []) as DocumentBlock[],
    label: row.label as RevisionLabel,
    createdAt: row.created_at,
  };
}

// --- Document Operations ---

export async function getDocument(
  db: D1Database,
  id: string
): Promise<Document | undefined> {
  const row = await db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .bind(id)
    .first<DocumentRow>();

  return row ? documentFromRow(row) : undefined;
}

export async function getDocumentBySlug(
  db: D1Database,
  contentType: ContentType,
  slug: string
): Promise<Document | undefined> {
  const row = await db
    .prepare(
      "SELECT * FROM documents WHERE content_type = ? AND slug = ?"
    )
    .bind(contentType, slug)
    .first<DocumentRow>();

  return row ? documentFromRow(row) : undefined;
}

export async function getDocuments(
  db: D1Database,
  contentType?: ContentType,
  status?: DocumentStatus
): Promise<Document[]> {
  let query = "SELECT * FROM documents";
  const conditions: string[] = [];
  const params: string[] = [];

  if (contentType) {
    conditions.push("content_type = ?");
    params.push(contentType);
  }

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY updated_at DESC";

  const stmt = db.prepare(query);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  const { results } = await bound.all<DocumentRow>();

  return (results ?? []).map(documentFromRow);
}

export async function createDocument(
  db: D1Database,
  document: Document
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO documents (
        id, content_type, slug, status, title, metadata, blocks,
        published_at, updated_at, published_slug, scheduled_at,
        category_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      document.id,
      document.contentType,
      document.slug,
      document.status,
      document.title,
      JSON.stringify(document.metadata),
      JSON.stringify(document.blocks),
      document.publishedAt ?? null,
      document.updatedAt,
      document.publishedSlug ?? null,
      document.scheduledAt ?? null,
      document.categoryId ?? null,
      document.createdAt
    )
    .run();
}

export async function updateDocument(
  db: D1Database,
  document: Document
): Promise<void> {
  await db
    .prepare(
      `UPDATE documents SET
        slug = ?,
        status = ?,
        title = ?,
        metadata = ?,
        blocks = ?,
        published_at = ?,
        updated_at = ?,
        published_slug = ?,
        scheduled_at = ?,
        category_id = ?
      WHERE id = ?`
    )
    .bind(
      document.slug,
      document.status,
      document.title,
      JSON.stringify(document.metadata),
      JSON.stringify(document.blocks),
      document.publishedAt ?? null,
      document.updatedAt,
      document.publishedSlug ?? null,
      document.scheduledAt ?? null,
      document.categoryId ?? null,
      document.id
    )
    .run();
}

export async function deleteDocument(
  db: D1Database,
  id: string
): Promise<void> {
  await db
    .prepare("DELETE FROM documents WHERE id = ?")
    .bind(id)
    .run();
}

// --- Revision Operations ---

export async function createRevision(
  db: D1Database,
  revision: DocumentRevision
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO document_revisions (
        id, document_id, slug, title, metadata, blocks, label, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      revision.id,
      revision.documentId,
      revision.slug,
      revision.title,
      JSON.stringify(revision.metadata),
      JSON.stringify(revision.blocks),
      revision.label,
      revision.createdAt
    )
    .run();
}

export async function getRevisions(
  db: D1Database,
  documentId: string
): Promise<DocumentRevision[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM document_revisions WHERE document_id = ? ORDER BY created_at DESC"
    )
    .bind(documentId)
    .all<RevisionRow>();

  return (results ?? []).map(revisionFromRow);
}

export async function getLatestPublishedRevision(
  db: D1Database,
  documentId: string
): Promise<DocumentRevision | undefined> {
  const row = await db
    .prepare(
      `SELECT * FROM document_revisions
       WHERE document_id = ? AND label = 'published'
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .bind(documentId)
    .first<RevisionRow>();

  return row ? revisionFromRow(row) : undefined;
}
