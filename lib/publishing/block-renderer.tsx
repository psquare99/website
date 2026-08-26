import type { ReactNode } from "react";

export interface Block {
  id: string;
  type: string;
  data: unknown;
}

/**
 * Validates that a URL has a safe scheme for use in <img src>.
 * Blocks javascript:, data:text/html, and other dangerous schemes.
 * Allows http://, https://, and / (relative paths).
 */
function isValidImageSrc(src: string): boolean {
  if (!src) return false;
  const trimmed = src.trim().toLowerCase();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

function JournalImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  if (!isValidImageSrc(src)) return null;
  return (
    <figure className="journal-image">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </figure>
  );
}

function renderBlock(block: Block): ReactNode {
  switch (block.type) {
    case "paragraph": {
      const data = block.data as { text?: string };
      return <p key={block.id}>{data.text ?? ""}</p>;
    }

    case "heading": {
      const data = block.data as { text?: string; level?: number };
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
      const data = block.data as { text?: string };
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
      const data = block.data as { src?: string; alt?: string };
      if (!data.src) return null;
      if (!isValidImageSrc(data.src)) return null;
      return (
        <JournalImage
          key={block.id}
          src={data.src}
          alt={data.alt ?? ""}
        />
      );
    }

    default:
      return null;
  }
}

export function renderBlocks(blocks: Block[]): ReactNode[] {
  return blocks.map(renderBlock);
}
