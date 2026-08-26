"use client";

import { useState } from "react";
import type { Document } from "@/lib/domain/document";

interface PublishControlsProps {
  document: Document;
  hasUnsavedChanges: boolean;
  flushAndPublish: () => Promise<boolean>;
  unpublish: () => Promise<boolean>;
  refreshDocument: () => Promise<void>;
}

export default function PublishControls({
  document,
  hasUnsavedChanges,
  flushAndPublish,
  unpublish,
  refreshDocument,
}: PublishControlsProps) {
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [error, setError] = useState("");

  async function handlePublish() {
    if (!confirm("Publish this document?")) return;
    setPublishing(true);
    setError("");
    try {
      const ok = await flushAndPublish();
      if (!ok) setError("Publish failed.");
      else await refreshDocument();
    } catch {
      setError("Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!confirm("Unpublish this document? It will no longer be visible publicly.")) return;
    setUnpublishing(true);
    setError("");
    try {
      const ok = await unpublish();
      if (!ok) setError("Unpublish failed.");
      else await refreshDocument();
    } catch {
      setError("Unpublish failed.");
    } finally {
      setUnpublishing(false);
    }
  }

  async function handleSchedule() {
    if (!scheduleDate) return;
    setScheduling(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/documents/${document.id}/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduledAt: new Date(scheduleDate).toISOString(),
          }),
        }
      );
      if (res.ok) {
        setScheduleDate("");
        await refreshDocument();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Schedule failed.");
      }
    } catch {
      setError("Schedule failed.");
    } finally {
      setScheduling(false);
    }
  }

  async function handleCancelSchedule() {
    if (!confirm("Cancel this scheduled publish?")) return;
    setError("");
    try {
      const res = await fetch(
        `/api/admin/documents/${document.id}/schedule`,
        { method: "DELETE" }
      );
      if (res.ok) await refreshDocument();
      else setError("Cancel failed.");
    } catch {
      setError("Cancel failed.");
    }
  }

  const canPublish = document.status === "draft" || document.status === "modified" || document.status === "unpublished";
  const canUnpublish = document.status === "published" || document.status === "modified";
  const canSchedule = document.status === "draft";

  return (
    <div className="space-y-3">
      {canPublish && (
        <button
          onClick={handlePublish}
          disabled={publishing || (hasUnsavedChanges && false)}
          className="w-full rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {publishing
            ? "Publishing..."
            : document.status === "draft" || document.status === "unpublished"
              ? "Publish"
              : "Publish changes"}
        </button>
      )}
      {canUnpublish && (
        <button
          onClick={handleUnpublish}
          disabled={unpublishing}
          className="w-full rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {unpublishing ? "Unpublishing..." : "Unpublish"}
        </button>
      )}

      {canSchedule && (
        <div className="space-y-2 rounded border border-blue-100 bg-blue-50 p-3">
          <div className="text-xs font-medium text-blue-700">Schedule</div>
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full rounded border border-blue-200 px-2 py-1.5 text-sm"
          />
          <button
            onClick={handleSchedule}
            disabled={!scheduleDate || scheduling}
            className="w-full rounded border border-blue-200 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            {scheduling ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {document.publishedAt && (
        <div className="rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
          <div>
            Published: {new Date(document.publishedAt).toLocaleString()}
          </div>
          {document.publishedSlug && (
            <div className="mt-1">
              Public URL: /{document.publishedSlug}
            </div>
          )}
        </div>
      )}

      {document.scheduledAt && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
          <div>
            Scheduled: {new Date(document.scheduledAt).toLocaleString()}
          </div>
          <button
            onClick={handleCancelSchedule}
            className="mt-2 text-blue-600 underline hover:text-blue-800"
          >
            Cancel schedule
          </button>
        </div>
      )}
    </div>
  );
}
