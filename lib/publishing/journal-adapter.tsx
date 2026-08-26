import type { ReactNode } from "react";
import type { JournalEntry } from "@/types/journal";
import { renderBlocks, type Block } from "./block-renderer";

export interface PublishedDocumentMetadata {
  title: string;
  excerpt?: string;
  category?: string;
  location?: string;
  featured?: boolean;
  image?: string;
}

export interface PublishedBlock {
  id: string;
  type: string;
  data: unknown;
}

export interface PublishedDocument {
  contractVersion: "0.1";

  id: string;

  contentType: "journal";

  slug: string;

  publishedAt: string;

  metadata: PublishedDocumentMetadata;

  blocks: Block[];
}

function getBlockText(
  block: PublishedBlock
): string {
  if (
    block.type !== "paragraph" &&
    block.type !== "heading" &&
    block.type !== "quote"
  ) {
    return "";
  }

  const data = block.data as {
    text?: string;
  };

  return data.text ?? "";
}

function estimateReadingTime(
  blocks: PublishedBlock[]
): string {
  const words = blocks.reduce(
    (count, block) => {
      const text =
        getBlockText(block);

      if (!text) {
        return count;
      }

      return (
        count +
        text
          .trim()
          .split(/\s+/)
          .filter(Boolean).length
      );
    },
    0
  );

  const minutes = Math.max(
    1,
    Math.ceil(words / 200)
  );

  return `${minutes} min`;
}

export function journalFromPublishedDocument(
  document: PublishedDocument
): JournalEntry {
  if (document.contentType !== "journal") {
    throw new Error(
      `Cannot adapt "${document.contentType}" as a journal.`
    );
  }

  const category =
    document.metadata.category?.trim() ||
    "uncategorized";

  return {
    slug: document.slug,

    title: document.metadata.title,

    excerpt:
      document.metadata.excerpt ?? "",

    content: (
      <div className="space-y-6">
        {renderBlocks(document.blocks)}
      </div>
    ),

    published: document.publishedAt,

    readingTime:
      estimateReadingTime(
        document.blocks
      ),

    category,

    status: "published",

    featured:
      document.metadata.featured,

    location:
      document.metadata.location,

    paper: "cream",

    image:
      typeof document.metadata.image === "string" &&
      document.metadata.image
        ? { src: document.metadata.image, alt: document.metadata.title }
        : undefined,
  };
}