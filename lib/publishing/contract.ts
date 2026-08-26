// Durable V1: Publishing Contract v0.1 transformation
// Transforms D1 documents into the existing Contract v0.1 format
// that the website adapters already understand.

import type { Document, DocumentBlock, DocumentMetadata } from "@/lib/domain/document";
import type { PublishedDocument, PublishedDocumentMetadata, PublishedBlock } from "./journal-adapter";
import type { PublishedProjectDocument } from "./project-adapter";
import type { PublishedPageDocument } from "./page-adapter";
import type { ProjectBlock } from "@/types/project";

// --- Contract v0.1 Types (re-exported for clarity) ---

export type { PublishedDocument, PublishedProjectDocument, PublishedPageDocument };

// --- Transformation Functions ---

/**
 * Transform D1 document blocks into Contract v0.1 blocks.
 * Preserves the existing block structure.
 */
function toPublishedBlocks(blocks: DocumentBlock[]): PublishedBlock[] {
  return blocks.map((block) => ({
    id: block.id,
    type: block.type,
    data: block.data,
  }));
}

/**
 * Transform D1 document metadata into journal Contract v0.1 metadata.
 * Extracts the known journal fields.
 *
 * The title parameter is the top-level document.title (source of truth),
 * NOT metadata.title. This ensures the contract output reflects the
 * authoritative title even if metadata.title diverges.
 */
function toJournalMetadata(
  metadata: DocumentMetadata,
  title: string
): PublishedDocumentMetadata {
  return {
    title,
    excerpt: typeof metadata.excerpt === "string" ? metadata.excerpt : undefined,
    category: typeof metadata.category === "string" ? metadata.category : undefined,
    location: typeof metadata.location === "string" ? metadata.location : undefined,
    featured: typeof metadata.featured === "boolean" ? metadata.featured : undefined,
    image: typeof metadata.image === "string" ? metadata.image : undefined,
  };
}

/**
 * Transform a D1 journal document into Contract v0.1 PublishedDocument.
 */
export function toPublishedJournalDocument(
  document: Document
): PublishedDocument {
  if (document.contentType !== "journal") {
    throw new Error(
      `Cannot transform "${document.contentType}" as a journal.`
    );
  }

  return {
    contractVersion: "0.1",
    id: document.id,
    contentType: "journal",
    slug: document.slug,
    publishedAt: document.publishedAt ?? document.createdAt,
    metadata: toJournalMetadata(document.metadata, document.title),
    blocks: toPublishedBlocks(document.blocks),
  };
}

/**
 * Transform a D1 project document into Contract v0.1 PublishedProjectDocument.
 */
export function toPublishedProjectDocument(
  document: Document
): PublishedProjectDocument {
  if (document.contentType !== "project") {
    throw new Error(
      `Cannot transform "${document.contentType}" as a project.`
    );
  }

  return {
    contractVersion: "0.1",
    id: document.id,
    contentType: "project",
    slug: document.slug,
    publishedAt: document.publishedAt ?? document.createdAt,
    metadata: { ...document.metadata, title: document.title } as Record<string, unknown>,
    blocks: toPublishedBlocks(document.blocks) as ProjectBlock[],
  };
}

/**
 * Transform D1 page metadata into Page Contract v0.1 metadata.
 * Uses top-level document.title as source of truth.
 */
function toPageMetadata(
  metadata: DocumentMetadata,
  title: string
): { title: string; description?: string; navigationLabel?: string } {
  return {
    title,
    description: typeof metadata.description === "string" ? metadata.description : undefined,
    navigationLabel: typeof metadata.navigationLabel === "string" ? metadata.navigationLabel : undefined,
  };
}

/**
 * Transform a D1 page document into Contract v0.1 PublishedPageDocument.
 */
export function toPublishedPageDocument(document: Document): PublishedPageDocument {
  if (document.contentType !== "page") {
    throw new Error(
      `Cannot transform "${document.contentType}" as a page.`
    );
  }

  return {
    contractVersion: "0.1",
    id: document.id,
    contentType: "page",
    slug: document.slug,
    publishedAt: document.publishedAt ?? document.createdAt,
    metadata: toPageMetadata(document.metadata, document.title),
    blocks: toPublishedBlocks(document.blocks),
  };
}

/**
 * Transform a D1 document revision into Contract v0.1 PublishedDocument.
 * Uses the revision's snapshot data, not the current document state.
 */
export function toPublishedDocumentFromRevision(
  revision: {
    slug: string;
    title: string;
    metadata: DocumentMetadata;
    blocks: DocumentBlock[];
    createdAt: string;
  },
  contentType: "journal" | "project" | "page"
): PublishedDocument | PublishedProjectDocument | PublishedPageDocument {
  if (contentType === "journal") {
    return {
      contractVersion: "0.1",
      id: "",
      contentType: "journal",
      slug: revision.slug,
      publishedAt: revision.createdAt,
      metadata: toJournalMetadata(revision.metadata, revision.title),
      blocks: toPublishedBlocks(revision.blocks),
    };
  }

  if (contentType === "project") {
    return {
      contractVersion: "0.1",
      id: "",
      contentType: "project",
      slug: revision.slug,
      publishedAt: revision.createdAt,
      metadata: { ...revision.metadata, title: revision.title } as Record<string, unknown>,
      blocks: toPublishedBlocks(revision.blocks) as ProjectBlock[],
    };
  }

  // page
  return {
    contractVersion: "0.1",
    id: "",
    contentType: "page",
    slug: revision.slug,
    publishedAt: revision.createdAt,
    metadata: toPageMetadata(revision.metadata, revision.title),
    blocks: toPublishedBlocks(revision.blocks),
  };
}
