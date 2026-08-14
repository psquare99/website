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

    case "heading": {
      const data = block.data as {
        text?: string;
        level?: number;
      };

      const text = data.text ?? "";

      return (
        <h2
          key={block.id}
          className="text-3xl font-semibold tracking-tight text-[#2C2A28]"
        >
          {text}
        </h2>
      );
    }

    case "quote": {
      const data = block.data as {
        text?: string;
      };

      return (
        <blockquote
          key={block.id}
          className="border-l-4 border-[#D8CEC1] pl-6 text-xl italic leading-8 text-[#5F564D]"
        >
          {data.text ?? ""}
        </blockquote>
      );
    }

    case "image": {
      const data = block.data as {
        src?: string;
        alt?: string;
      };

      if (!data.src) {
        return null;
      }

      return (
        <figure
          key={block.id}
          className="overflow-hidden rounded-xl"
        >
          <img
            src={data.src}
            alt={data.alt ?? ""}
            className="h-auto w-full"
          />
        </figure>
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
  };
}