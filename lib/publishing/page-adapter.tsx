import type { ReactNode } from "react";
import type { Page } from "@/types/page";
import { renderBlocks, type Block } from "./block-renderer";

export interface PublishedPageMetadata {
  title: string;
  description?: string;
  navigationLabel?: string;
}

export interface PublishedPageDocument {
  contractVersion: "0.1";

  id: string;

  contentType: "page";

  slug: string;

  publishedAt: string;

  metadata: PublishedPageMetadata;

  blocks: Block[];
}

/**
 * Adapt a published Page document (Contract v0.1) into the public Page type.
 */
export function pageFromPublishedDocument(document: PublishedPageDocument): Page {
  if (document.contentType !== "page") {
    throw new Error(
      `Cannot adapt "${document.contentType}" as a page.`
    );
  }

  return {
    slug: document.slug,
    title: document.metadata.title,
    description: document.metadata.description,
    content: (
      <div className="space-y-6">
        {renderBlocks(document.blocks)}
      </div>
    ),
    publishedAt: document.publishedAt,
  };
}
