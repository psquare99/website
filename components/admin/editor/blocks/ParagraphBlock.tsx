"use client";

import type { DocumentBlock } from "@/lib/domain/document";
import ImageUpload from "../ImageUpload";

interface ParagraphBlockProps {
  block: DocumentBlock;
  onChange: (data: Record<string, unknown>) => void;
}

export default function ParagraphBlock({ block, onChange }: ParagraphBlockProps) {
  return (
    <textarea
      value={(block.data.text as string) ?? ""}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Write something..."
      rows={3}
      className="w-full resize-y rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
    />
  );
}
