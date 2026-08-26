"use client";

import type { SaveStatus } from "@/lib/editor/editor-types";
import SaveIndicator from "./SaveIndicator";
import type { Document, DocumentStatus } from "@/lib/domain/document";

const STATUS_STYLES: Record<DocumentStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-50 text-green-700",
  modified: "bg-yellow-50 text-yellow-700",
  scheduled: "bg-blue-50 text-blue-700",
  unpublished: "bg-red-50 text-red-600",
};

interface EditorHeaderProps {
  document: Document;
  title: string;
  slug: string;
  saveStatus: SaveStatus;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onSave: () => void;
  titleError?: string;
  slugError?: string;
}

export default function EditorHeader({
  document,
  title,
  slug,
  saveStatus,
  onTitleChange,
  onSlugChange,
  onSave,
  titleError,
  slugError,
}: EditorHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[document.status]}`}
          >
            {document.status}
          </span>
          <SaveIndicator status={saveStatus} onRetry={onSave} />
        </div>
      </div>

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Document title"
          className={`w-full border-0 bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 ${titleError ? "ring-2 ring-red-400 rounded px-2 -mx-2" : ""}`}
        />
        {titleError && (
          <p className="mt-1 text-xs text-red-600">{titleError}</p>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <span className="mr-1 text-sm text-gray-400">/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="document-slug"
            className={`flex-1 border-0 bg-transparent font-mono text-sm text-gray-500 outline-none placeholder:text-gray-300 ${slugError ? "ring-2 ring-red-400 rounded px-2 -mx-2" : ""}`}
          />
        </div>
        {slugError && (
          <p className="mt-1 text-xs text-red-600">{slugError}</p>
        )}
        {document.publishedSlug && document.publishedSlug !== slug && (
          <p className="mt-1 text-xs text-amber-600">
            Slug changed from &ldquo;{document.publishedSlug}&rdquo; &mdash; publishing will create a redirect.
          </p>
        )}
      </div>
    </div>
  );
}
