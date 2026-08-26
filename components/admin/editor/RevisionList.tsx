"use client";

import { useState, useEffect, useCallback } from "react";
import type { DocumentRevision, RevisionLabel } from "@/lib/domain/document";

interface RevisionListProps {
  documentId: string;
  currentStatus: string;
  onRestore: () => void;
}

const LABEL_BADGES: Record<RevisionLabel, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  backup: "bg-amber-100 text-amber-700",
};

export default function RevisionList({
  documentId,
  currentStatus,
  onRestore,
}: RevisionListProps) {
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const fetchRevisions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/documents/${documentId}/revisions`
      );
      if (res.ok) {
        const data = (await res.json()) as DocumentRevision[];
        setRevisions(data);
      }
    } catch {
      setError("Failed to load revisions");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  async function handleRestore(revisionId: string) {
    if (!confirm("Restore this revision? Current content will be backed up.")) return;
    setRestoring(true);
    try {
      const res = await fetch(
        `/api/admin/documents/${documentId}/revisions/${revisionId}/restore`,
        { method: "POST" }
      );
      if (res.ok) {
        onRestore();
        setExpandedId(null);
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Restore failed");
      }
    } catch {
      setError("Restore failed");
    } finally {
      setRestoring(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-400">Loading revisions...</div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (revisions.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">No revisions yet.</div>
    );
  }

  const canRestore = currentStatus === "draft" || currentStatus === "unpublished";

  return (
    <div className="space-y-2">
      {revisions.map((rev) => (
        <div
          key={rev.id}
          className="rounded border border-gray-200 bg-gray-50 p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                  LABEL_BADGES[rev.label] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {rev.label}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(rev.createdAt).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() =>
                setExpandedId(expandedId === rev.id ? null : rev.id)
              }
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {expandedId === rev.id ? "Hide" : "View"}
            </button>
          </div>

          {expandedId === rev.id && (
            <div className="mt-3 space-y-2 border-t border-gray-200 pt-2">
              <div className="text-xs text-gray-500">
                <strong>Title:</strong> {rev.title || "(empty)"}
              </div>
              <div className="text-xs text-gray-500">
                <strong>Slug:</strong> /{rev.slug}
              </div>
              <div className="text-xs text-gray-500">
                <strong>Blocks:</strong>{" "}
                {Array.isArray(rev.blocks) ? rev.blocks.length : 0}
              </div>
              {canRestore && (
                <button
                  onClick={() => handleRestore(rev.id)}
                  disabled={restoring}
                  className="rounded border border-blue-200 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  {restoring ? "Restoring..." : "Restore this revision"}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
