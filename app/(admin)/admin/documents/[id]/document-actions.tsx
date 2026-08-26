"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Document } from "@/lib/domain/document";

const DELETABLE_STATUSES = ["draft", "unpublished"] as const;

function getBackPath(contentType: string): string {
  return contentType === "project"
    ? "/admin/projects"
    : contentType === "page"
      ? "/admin/pages"
      : "/admin/journal";
}

function getDeleteHint(status: string): string | null {
  switch (status) {
    case "published":
      return "Unpublish this document first. It will then become unpublished and deletable.";
    case "modified":
      return "This document has published content. Unpublish it first, then delete.";
    case "scheduled":
      return "Cancel the scheduled publish first. The document will become a draft and can then be deleted.";
    default:
      return null;
  }
}

export default function DocumentActions({ document }: { document: Document }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = DELETABLE_STATUSES.includes(
    document.status as (typeof DELETABLE_STATUSES)[number]
  );

  async function handleDelete() {
    const label =
      document.status === "unpublished" ? "unpublished document" : "draft";
    if (
      !confirm(
        `Delete this ${label}? This cannot be undone.\n\nAll revisions and redirects will be removed. Media files will not be deleted.`
      )
    )
      return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/documents/${document.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(getBackPath(document.contentType));
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Delete failed.");
      }
    } catch {
      setError("Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  const hint = getDeleteHint(document.status);

  return (
    <div className="space-y-3">
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting
            ? "Deleting..."
            : `Delete ${document.status === "unpublished" ? "unpublished document" : "draft"}`}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
