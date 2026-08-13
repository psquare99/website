import type { JournalEntry } from "@/types/journal";

export interface PublishedDocument {
  contractVersion: "0.1";

  id: string;

  contentType: string;

  slug: string;

  publishedAt: string;

  metadata: {
    title: string;
    excerpt?: string;
    category?: string;
    location?: string;
    featured?: boolean;
  };

  blocks: PublishedBlock[];
}

export interface PublishedBlock {
  id: string;

  type: string;

  data: unknown;
}

function blocksToContent(
  blocks: PublishedBlock[]
): JournalEntry["content"] {
  return blocks.map((block) => {
    if (block.type === "paragraph") {
      const data = block.data as {
        text?: string;
      };

      return (
        <p key={block.id}>
          {data.text ?? ""}
        </p>
      );
    }

    return null;
  });
}

function calculateReadingTime(
  blocks: PublishedBlock[]
): string {
  const text = blocks
    .map((block) => {
      if (block.type !== "paragraph") {
        return "";
      }

      const data = block.data as {
        text?: string;
      };

      return data.text ?? "";
    })
    .join(" ");

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;

  const minutes = Math.max(
    1,
    Math.ceil(wordCount / 200)
  );

  return `${minutes} min`;
}

export function journalFromPublishedDocument(
  document: PublishedDocument
): JournalEntry {
  if (document.contentType !== "journal") {
    throw new Error(
      `Cannot create JournalEntry from content type "${document.contentType}".`
    );
  }

  return {
    slug: document.slug,

    title: document.metadata.title,

    excerpt: document.metadata.excerpt ?? "",

    content: blocksToContent(document.blocks),

    readingTime: calculateReadingTime(document.blocks),

    category:
      document.metadata.category ?? "uncategorized",

    published: document.publishedAt,

    status: "published",

    location: document.metadata.location,

    featured: document.metadata.featured,

    // Website presentation decision.
    // Studio does not control this.
    paper: "linen",
  };
}