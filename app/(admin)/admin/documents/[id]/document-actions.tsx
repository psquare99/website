"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Document } from "@/lib/domain/document";

export default function DocumentActions({ document }: { document: Document }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/documents/${document.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const backPath =
          document.contentType === "project"
            ? "/admin/projects"
            : document.contentType === "page"
              ? "/admin/pages"
              : "/admin/journal";
        router.push(backPath);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      {document.status === "draft" && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete draft"}
        </button>
      )}
      {document.status !== "draft" && (
        <p className="text-sm text-gray-500">
          Only draft documents can be deleted from the detail view.
        </p>
      )}
    </div>
  );
}
