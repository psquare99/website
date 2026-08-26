"use client";

import { useState, useEffect, useCallback } from "react";

interface MediaAsset {
  id: string;
  storageKey: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
}

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media?limit=100");
      if (res.ok) {
        const data = (await res.json()) as {
          assets: MediaAsset[];
          total: number;
        };
        setAssets(data.assets);
        setTotal(data.total);
      }
    } catch {
      setError("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchAssets();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(asset: MediaAsset) {
    if (
      !confirm(
        `Delete "${asset.filename}"? This cannot be undone.`
      )
    )
      return;

    setError("");

    try {
      const res = await fetch(`/api/admin/media/${asset.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAssets();
      } else {
        const data = (await res.json()) as {
          error?: string;
          references?: { id: string; title: string; slug: string }[];
        };
        if (data.references) {
          setError(
            `${data.error}\nReferenced by: ${data.references.map((r) => `"${r.title}"`).join(", ")}`
          );
        } else {
          setError(data.error ?? "Delete failed");
        }
      }
    } catch {
      setError("Delete failed");
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Media</h1>
        <label className="cursor-pointer rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : assets.length === 0 ? (
        <div className="text-sm text-gray-400 italic">
          No media uploaded yet.
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400">
            {total} asset{total !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group relative overflow-hidden rounded border border-gray-200 bg-white"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={asset.publicUrl}
                    alt={asset.alt || asset.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <div className="truncate text-xs text-gray-700">
                    {asset.filename}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatSize(asset.size)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(asset)}
                  className="absolute right-1 top-1 rounded bg-red-600 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
