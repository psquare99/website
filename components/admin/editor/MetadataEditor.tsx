"use client";

import type { ContentSchema } from "@/lib/editor/schemas";
import type { DocumentMetadata } from "@/lib/domain/document";
import MetadataField from "./MetadataField";

interface MetadataEditorProps {
  schema: ContentSchema;
  metadata: DocumentMetadata;
  onChange: (key: string, value: unknown) => void;
  errors: Record<string, string>;
}

export default function MetadataEditor({
  schema,
  metadata,
  onChange,
  errors,
}: MetadataEditorProps) {
  if (schema.metadataFields.length === 0) return null;

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-medium text-gray-900">Metadata</h2>
      {schema.metadataFields.map((field) => (
        <MetadataField
          key={field.key}
          field={field}
          value={metadata[field.key]}
          onChange={(v) => onChange(field.key, v)}
          error={errors[`metadata.${field.key}`]}
        />
      ))}
    </div>
  );
}
