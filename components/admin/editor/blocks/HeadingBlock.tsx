"use client";

import type { DocumentBlock } from "@/lib/domain/document";

interface HeadingBlockProps {
  block: DocumentBlock;
  onChange: (data: Record<string, unknown>) => void;
}

export default function HeadingBlock({ block, onChange }: HeadingBlockProps) {
  const level = (block.data.level as number) ?? 2;

  return (
    <div className="space-y-2">
      <select
        value={level}
        onChange={(e) => onChange({ level: Number(e.target.value) })}
        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700"
      >
        <option value={2}>H2</option>
        <option value={3}>H3</option>
        <option value={4}>H4</option>
      </select>
      <input
        type="text"
        value={(block.data.text as string) ?? ""}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Heading text"
        className="w-full rounded border border-gray-200 px-3 py-2 text-lg font-semibold text-gray-900 outline-none focus:border-gray-400"
      />
    </div>
  );
}
