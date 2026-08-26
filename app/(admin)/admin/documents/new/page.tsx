"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ContentType } from "@/lib/domain/document";

const VALID_TYPES: ContentType[] = ["journal", "project", "page"];

function NewDocumentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialType: ContentType =
    typeParam && VALID_TYPES.includes(typeParam as ContentType)
      ? (typeParam as ContentType)
      : "journal";

  const [contentType, setContentType] = useState<ContentType>(initialType);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, title, slug: slug || undefined }),
      });

      const data = (await res.json()) as {
        id?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Failed to create document.");
        return;
      }

      router.push(`/admin/documents/${data.id}`);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentType)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-500"
        >
          {VALID_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-500"
          autoFocus
          required
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Slug
          <span className="ml-1 font-normal text-gray-400">
            (optional, auto-generated from title)
          </span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-gray-500"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function NewDocumentPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        New document
      </h1>
      <Suspense>
        <NewDocumentForm />
      </Suspense>
    </>
  );
}
