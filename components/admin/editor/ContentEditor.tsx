"use client";

import { useState } from "react";
import type { DocumentBlock } from "@/lib/domain/document";
import type { ContentSchema } from "@/lib/editor/schemas";
import { insertBlock, removeBlock, duplicateBlock, moveBlockUp, moveBlockDown, updateBlockData } from "@/lib/editor/block-utils";
import BlockItem from "./BlockItem";

interface ContentEditorProps {
  schema: ContentSchema;
  blocks: DocumentBlock[];
  onChange: (blocks: DocumentBlock[]) => void;
}

const BLOCK_LABELS: Record<string, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  quote: "Quote",
  image: "Image",
};

export default function ContentEditor({
  schema,
  blocks,
  onChange,
}: ContentEditorProps) {
  const [showPicker, setShowPicker] = useState(false);

  function handleAddBlock(type: DocumentBlock["type"]) {
    const next = insertBlock(blocks, type);
    onChange(next);
    setShowPicker(false);
  }

  function handleDeleteBlock(id: string) {
    onChange(removeBlock(blocks, id));
  }

  function handleDuplicateBlock(block: DocumentBlock) {
    const idx = blocks.findIndex((b) => b.id === block.id);
    if (idx < 0) return;
    const dup = duplicateBlock(block);
    const next = [...blocks];
    next.splice(idx + 1, 0, dup);
    onChange(next);
  }

  function handleMoveUp(index: number) {
    onChange(moveBlockUp(blocks, index));
  }

  function handleMoveDown(index: number) {
    onChange(moveBlockDown(blocks, index));
  }

  function handleUpdateBlock(id: string, data: Record<string, unknown>) {
    onChange(updateBlockData(blocks, id, data));
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-900">Content</h2>

      <div className="space-y-3">
        {blocks.map((block, idx) => (
          <BlockItem
            key={block.id}
            block={block}
            index={idx}
            total={blocks.length}
            onChange={(data) => handleUpdateBlock(block.id, data)}
            onDelete={() => handleDeleteBlock(block.id)}
            onDuplicate={() => handleDuplicateBlock(block)}
            onMoveUp={() => handleMoveUp(idx)}
            onMoveDown={() => handleMoveDown(idx)}
          />
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full rounded border border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          + Add block
        </button>
        {showPicker && (
          <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {schema.allowedBlockTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleAddBlock(type)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                {BLOCK_LABELS[type] ?? type}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
