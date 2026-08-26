// Durable V1: Public read functions
// D1-backed, revision-based. These are the ONLY way public pages access content.
//
// Core rule: content is served from document_revisions (label='published'),
// never from live documents.metadata/documents.blocks directly.
// This makes the modified-status safety guarantee real.

import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { JournalEntry } from "@/types/journal";
import type { Project } from "@/types/project";
import type { Page } from "@/types/page";
import type { ContentType } from "@/lib/domain/document";

import { toPublishedDocumentFromRevision } from "./contract";
import {
  journalFromPublishedDocument,
} from "./journal-adapter";
import {
  projectFromPublishedDocument,
} from "./project-adapter";
import {
  pageFromPublishedDocument,
} from "./page-adapter";

// --- Row types for D1 queries ---

interface PublicDocRow {
  id: string;
  content_type: string;
  published_slug: string | null;
  published_at: string | null;
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

// --- Internal helpers ---

function getDb() {
  const { env } = getCloudflareContext();
  return env.CONTENT_DB;
}

/**
 * Fetch all publicly live documents (status = published OR modified)
 * for a given content type. Only returns the minimal columns needed
 * for listing and slug resolution — revision content is fetched separately.
 *
 * The status filter is applied at the query level, not in memory.
 */
async function getPublicDocuments(
  contentType: ContentType
): Promise<PublicDocRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT id, content_type, published_slug, published_at
       FROM documents
       WHERE content_type = ? AND status IN ('published', 'modified')`
    )
    .bind(contentType)
    .all<PublicDocRow>();

  return results ?? [];
}

/**
 * Fetch the latest published revision for a document.
 * This is the content source of truth for public output.
 */
async function getLatestPublishedRevision(
  documentId: string
): Promise<RevisionRow | null> {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM document_revisions
       WHERE document_id = ? AND label = 'published'
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .bind(documentId)
    .first<RevisionRow>();
}

/**
 * Fetch a single publicly live document by its published_slug.
 * Uses published_slug (not editorial slug) for resolution —
 * a document mid-edit with a renamed-but-unpublished slug
 * still resolves at its old, currently-public URL.
 */
async function getPublicDocumentByPublishedSlug(
  contentType: ContentType,
  slug: string
): Promise<PublicDocRow | null> {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, content_type, published_slug, published_at
       FROM documents
       WHERE content_type = ? AND published_slug = ?
         AND status IN ('published', 'modified')`
    )
    .bind(contentType, slug)
    .first<PublicDocRow>();
}

// --- Public API ---

/**
 * Get all published journal entries.
 * Returns entries from published revisions of published/modified documents.
 * Errors propagate — never silently caught into an empty array.
 */
export async function getPublishedJournal(): Promise<JournalEntry[]> {
  const docs = await getPublicDocuments("journal");

  const entries: JournalEntry[] = [];
  for (const doc of docs) {
    const rev = await getLatestPublishedRevision(doc.id);
    if (!rev) continue;

    const published = toPublishedDocumentFromRevision(
      {
        slug: rev.slug,
        title: rev.title,
        metadata: JSON.parse(rev.metadata),
        blocks: JSON.parse(rev.blocks),
        createdAt: rev.created_at,
      },
      "journal"
    );

    entries.push(journalFromPublishedDocument(published as any));
  }

  return entries;
}

/**
 * Get a single published journal entry by its published slug.
 * Returns null if no matching published/modified document exists.
 * Errors propagate — never silently caught into null.
 */
export async function getPublishedJournalEntry(
  slug: string
): Promise<JournalEntry | null> {
  const doc = await getPublicDocumentByPublishedSlug("journal", slug);
  if (!doc) return null;

  const rev = await getLatestPublishedRevision(doc.id);
  if (!rev) return null;

  const published = toPublishedDocumentFromRevision(
    {
      slug: rev.slug,
      title: rev.title,
      metadata: JSON.parse(rev.metadata),
      blocks: JSON.parse(rev.blocks),
      createdAt: rev.created_at,
    },
    "journal"
  );

  return journalFromPublishedDocument(published as any);
}

/**
 * Get all published projects.
 * Returns projects from published revisions of published/modified documents.
 * Errors propagate — never silently caught into an empty array.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const docs = await getPublicDocuments("project");

  const projects: Project[] = [];
  for (const doc of docs) {
    const rev = await getLatestPublishedRevision(doc.id);
    if (!rev) continue;

    const published = toPublishedDocumentFromRevision(
      {
        slug: rev.slug,
        title: rev.title,
        metadata: JSON.parse(rev.metadata),
        blocks: JSON.parse(rev.blocks),
        createdAt: rev.created_at,
      },
      "project"
    );

    projects.push(projectFromPublishedDocument(published as any));
  }

  return projects;
}

/**
 * Get a single published project by its published slug.
 * Returns null if no matching published/modified document exists.
 * Errors propagate — never silently caught into null.
 */
export async function getPublishedProject(
  slug: string
): Promise<Project | null> {
  const doc = await getPublicDocumentByPublishedSlug("project", slug);
  if (!doc) return null;

  const rev = await getLatestPublishedRevision(doc.id);
  if (!rev) return null;

  const published = toPublishedDocumentFromRevision(
    {
      slug: rev.slug,
      title: rev.title,
      metadata: JSON.parse(rev.metadata),
      blocks: JSON.parse(rev.blocks),
      createdAt: rev.created_at,
    },
    "project"
  );

  return projectFromPublishedDocument(published as any);
}

// --- Pages ---

/**
 * Get all published pages.
 * Returns pages from published revisions of published/modified documents.
 * Errors propagate — never silently caught into an empty array.
 */
export async function getPublishedPages(): Promise<Page[]> {
  const docs = await getPublicDocuments("page");

  const pages: Page[] = [];
  for (const doc of docs) {
    const rev = await getLatestPublishedRevision(doc.id);
    if (!rev) continue;

    const published = toPublishedDocumentFromRevision(
      {
        slug: rev.slug,
        title: rev.title,
        metadata: JSON.parse(rev.metadata),
        blocks: JSON.parse(rev.blocks),
        createdAt: rev.created_at,
      },
      "page"
    );

    pages.push(pageFromPublishedDocument(published as any));
  }

  return pages;
}

/**
 * Get a single published page by its published slug.
 * Returns null if no matching published/modified document exists.
 * Errors propagate — never silently caught into null.
 */
export async function getPublishedPage(
  slug: string
): Promise<Page | null> {
  const doc = await getPublicDocumentByPublishedSlug("page", slug);
  if (!doc) return null;

  const rev = await getLatestPublishedRevision(doc.id);
  if (!rev) return null;

  const published = toPublishedDocumentFromRevision(
    {
      slug: rev.slug,
      title: rev.title,
      metadata: JSON.parse(rev.metadata),
      blocks: JSON.parse(rev.blocks),
      createdAt: rev.created_at,
    },
    "page"
  );

  return pageFromPublishedDocument(published as any);
}
