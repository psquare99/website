"use client";

import type { DocumentBlock } from "@/lib/domain/document";

interface QuoteBlockProps {
  block: DocumentBlock;
  onChange: (data: Record<string, unknown>) => void;
}

export default function QuoteBlock({ block, onChange }: QuoteBlockProps) {
  return (
    <div className="border-l-4 border-gray-300 pl-4">
      <textarea
        value={(block.data.text as string) ?? ""}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Quote text..."
        rows={3}
        className="w-full resize-y border-0 bg-transparent text-sm italic text-gray-700 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}
