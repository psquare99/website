import type { ReactNode } from "react";

import type { JournalEntry } from "@/types/journal";

export interface PublishedDocumentMetadata {
  title: string;
  excerpt?: string;
  category?: string;
  location?: string;
  featured?: boolean;
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

  blocks: PublishedBlock[];
}

function renderBlock(
  block: PublishedBlock
): ReactNode {
  switch (block.type) {
    case "paragraph": {
      const data = block.data as {
        text?: string;
      };

      return (
        <p key={block.id}>
          {data.text ?? ""}
        </p>
      );
    }

    default:
      return null;
  }
}

function renderBlocks(
  blocks: PublishedBlock[]
): ReactNode {
  return blocks.map(renderBlock);
}

function estimateReadingTime(
  blocks: PublishedBlock[]
): string {
  const words = blocks.reduce(
    (count, block) => {
      if (block.type !== "paragraph") {
        return count;
      }

      const data = block.data as {
        text?: string;
      };

      return (
        count +
        (data.text
          ? data.text
              .trim()
              .split(/\s+/)
              .filter(Boolean).length
          : 0)
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
  };
}