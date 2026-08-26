"use client";

import type { SaveStatus } from "@/lib/editor/editor-types";

const STATUS_CONFIG: Record<
  SaveStatus,
  { label: string; className: string }
> = {
  saved: {
    label: "Saved",
    className: "text-green-600",
  },
  unsaved: {
    label: "Unsaved changes",
    className: "text-amber-600",
  },
  saving: {
    label: "Saving...",
    className: "text-blue-600",
  },
  error: {
    label: "Save failed",
    className: "text-red-600",
  },
};

export default function SaveIndicator({
  status,
  onRetry,
}: {
  status: SaveStatus;
  onRetry?: () => void;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${config.className}`}>{config.label}</span>
      {status === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}
