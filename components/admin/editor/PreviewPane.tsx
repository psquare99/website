"use client";

import { useState, useMemo } from "react";
import { Eye, X } from "lucide-react";
import type { Document, DocumentBlock } from "@/lib/domain/document";
import { renderBlocks, type Block } from "@/lib/publishing/block-renderer";

interface PreviewPaneProps {
  document: Document;
  blocks: DocumentBlock[];
  title: string;
  slug: string;
}

export default function PreviewPane({
  document,
  blocks,
  title,
  slug,
}: PreviewPaneProps) {
  const [open, setOpen] = useState(false);

  const previewBlocks: Block[] = useMemo(
    () =>
      blocks.map((b) => ({
        id: b.id,
        type: b.type,
        data: b.data,
      })),
    [blocks]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        <Eye className="h-4 w-4" />
        Preview
      </button>
    );
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            Preview — {document.contentType}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <article className="mx-auto max-w-prose">
            {document.contentType === "journal" && (
              <header className="mb-8">
                <time className="text-sm text-gray-400">{dateStr}</time>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#2C2A28]">
                  {title || "Untitled"}
                </h1>
              </header>
            )}

            {document.contentType === "page" && (
              <header className="mb-8">
                <h1 className="text-4xl font-semibold tracking-tight text-[#2C2A28]">
                  {title || "Untitled"}
                </h1>
              </header>
            )}

            {document.contentType === "project" && (
              <header className="mb-8">
                <h1 className="text-4xl font-semibold tracking-tight text-[#2C2A28]">
                  {title || "Untitled"}
                </h1>
                {typeof document.metadata === "object" &&
                  document.metadata !== null &&
                  "tagline" in document.metadata && (
                    <p className="mt-2 text-lg text-gray-500">
                      {String(
                        (document.metadata as Record<string, unknown>).tagline
                      )}
                    </p>
                  )}
              </header>
            )}

            <div className="prose space-y-6 text-lg leading-relaxed text-[#3D3632]">
              {previewBlocks.length === 0 && (
                <p className="italic text-gray-400">No content yet.</p>
              )}
              {renderBlocks(previewBlocks)}
            </div>

            <footer className="mt-12 border-t border-gray-100 pt-4 text-xs text-gray-400">
              /{slug || "untitled"}
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
