"use client";

import type { DocumentBlock } from "@/lib/domain/document";
import ImageUpload from "../ImageUpload";

interface ImageBlockProps {
  block: DocumentBlock;
  onChange: (data: Record<string, unknown>) => void;
}

export default function ImageBlock({ block, onChange }: ImageBlockProps) {
  return (
    <div className="space-y-2">
      <ImageUpload
        value={(block.data.src as string) ?? ""}
        onChange={(src) => onChange({ src })}
        label="Block image"
      />
      <input
        type="text"
        value={(block.data.alt as string) ?? ""}
        onChange={(e) => onChange({ alt: e.target.value })}
        placeholder="Alt text"
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-400"
      />
    </div>
  );
}
