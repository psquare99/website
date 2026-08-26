"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Document, ContentType } from "@/lib/domain/document";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-50 text-green-700",
  modified: "bg-yellow-50 text-yellow-700",
  scheduled: "bg-blue-50 text-blue-700",
  unpublished: "bg-red-50 text-red-600",
};

export default function DocumentList({
  documents,
  contentType,
}: {
  documents: Document[];
  contentType: ContentType;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="mb-4 text-gray-500">No {contentType} documents yet.</p>
        <Link
          href={`/admin/documents/new?type=${contentType}`}
          className="inline-block rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Create first
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="px-4 py-3 font-medium text-gray-600">Slug</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 font-medium text-gray-600">Updated</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="border-b border-gray-100 last:border-0"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/documents/${doc.id}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {doc.title || "(untitled)"}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                {doc.slug}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[doc.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {doc.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                {doc.status === "draft" && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleting === doc.id}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {deleting === doc.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
