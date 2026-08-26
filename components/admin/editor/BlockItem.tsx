"use client";

import { useState } from "react";
import type { DocumentBlock } from "@/lib/domain/document";
import ParagraphBlock from "./blocks/ParagraphBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import ImageBlock from "./blocks/ImageBlock";

const BLOCK_LABELS: Record<string, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  quote: "Quote",
  image: "Image",
};

interface BlockItemProps {
  block: DocumentBlock;
  index: number;
  total: number;
  onChange: (data: Record<string, unknown>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function BlockItem({
  block,
  index,
  total,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: BlockItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">
          {BLOCK_LABELS[block.type] ?? block.type}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
            title="Move up"
          >
            &uarr;
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
            title="Move down"
          >
            &darr;
          </button>
          <button
            onClick={onDuplicate}
            className="rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Duplicate"
          >
            &#x2398;
          </button>
          <button
            onClick={handleDelete}
            className={`rounded px-1.5 py-0.5 text-xs hover:bg-gray-100 ${
              confirmDelete
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-400 hover:text-gray-700"
            }`}
            title={confirmDelete ? "Click again to confirm" : "Delete"}
          >
            {confirmDelete ? "Confirm?" : "\u00d7"}
          </button>
        </div>
      </div>

      {block.type === "paragraph" && (
        <ParagraphBlock block={block} onChange={onChange} />
      )}
      {block.type === "heading" && (
        <HeadingBlock block={block} onChange={onChange} />
      )}
      {block.type === "quote" && (
        <QuoteBlock block={block} onChange={onChange} />
      )}
      {block.type === "image" && (
        <ImageBlock block={block} onChange={onChange} />
      )}
    </div>
  );
}
