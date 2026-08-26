"use client";

import type { FieldSchema } from "@/lib/editor/schemas";
import ImageUpload from "./ImageUpload";

interface MetadataFieldProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export default function MetadataField({
  field,
  value,
  onChange,
  error,
}: MetadataFieldProps) {
  const baseInputClass =
    "w-full rounded border px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500";
  const borderClass = error ? "border-red-400" : "border-gray-300";

  if (field.type === "boolean") {
    return (
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          {field.label}
        </label>
        {field.description && (
          <p className="mt-0.5 text-xs text-gray-400">{field.description}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClass} ${borderClass}`}
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {field.description && (
          <p className="mt-0.5 text-xs text-gray-400">{field.description}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <ImageUpload
          value={(value as string) ?? ""}
          onChange={(url) => onChange(url)}
          label={field.label}
        />
        {field.description && (
          <p className="mt-0.5 text-xs text-gray-400">{field.description}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(value as string) ?? "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-gray-300"
          />
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className={`${baseInputClass} ${borderClass} font-mono`}
          />
        </div>
        {field.description && (
          <p className="mt-0.5 text-xs text-gray-400">{field.description}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === "list") {
    const items = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-1.5">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = e.target.value;
                  onChange(next);
                }}
                className={`${baseInputClass} ${borderClass} flex-1`}
              />
              <button
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx);
                  onChange(next);
                }}
                className="px-2 text-sm text-red-400 hover:text-red-600"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, ""])}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            + Add item
          </button>
        </div>
        {field.description && (
          <p className="mt-0.5 text-xs text-gray-400">{field.description}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === "textarea" || field.multiLine) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${baseInputClass} ${borderClass} resize-y`}
        />
        {field.description && (
          <p className="mt-0.5 text-xs text-gray-400">{field.description}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={field.type === "date" ? "date" : field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={`${baseInputClass} ${borderClass}`}
      />
      {field.description && (
        <p className="mt-0.5 text-xs text-gray-400">{field.description}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
