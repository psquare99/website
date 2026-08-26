import type { DocumentBlock, DocumentMetadata } from "@/lib/domain/document";
import type { ContentSchema, FieldSchema, SelectOption } from "./schemas";

export interface ValidationError {
  field: string;
  message: string;
}

function slugIsValid(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function validateField(
  field: FieldSchema,
  value: unknown
): string | null {
  if (field.required) {
    if (value === undefined || value === null || value === "") {
      return `${field.label} is required`;
    }
    if (field.type === "list" && Array.isArray(value) && value.length === 0) {
      return `${field.label} requires at least one item`;
    }
  }

  if (value === undefined || value === null || value === "") return null;

  if (field.type === "url" && typeof value === "string" && value !== "") {
    if (
      !value.startsWith("http://") &&
      !value.startsWith("https://") &&
      !value.startsWith("/")
    ) {
      return `${field.label} must be a valid URL`;
    }
  }

  if (field.type === "image" && typeof value === "string" && value !== "") {
    if (
      !value.startsWith("http://") &&
      !value.startsWith("https://") &&
      !value.startsWith("/")
    ) {
      return `${field.label} must be a valid image URL`;
    }
  }

  if (field.type === "color" && typeof value === "string" && value !== "") {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
      return `${field.label} must be a valid hex color`;
    }
  }

  if (field.type === "select" && field.options && typeof value === "string") {
    const opts: SelectOption[] = field.options;
    if (!opts.some((o: SelectOption) => o.value === value)) {
      return `${field.label} must be one of: ${opts.map((o: SelectOption) => o.label).join(", ")}`;
    }
  }

  return null;
}

export function validateDocument(
  schema: ContentSchema,
  title: string,
  slug: string,
  metadata: DocumentMetadata,
  blocks: DocumentBlock[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!title.trim()) {
    errors.push({ field: "title", message: "Title is required" });
  }

  if (!slug.trim()) {
    errors.push({ field: "slug", message: "Slug is required" });
  } else if (!slugIsValid(slug)) {
    errors.push({
      field: "slug",
      message:
        "Slug must contain only lowercase letters, numbers, and hyphens",
    });
  }

  for (const field of schema.metadataFields) {
    const value = metadata[field.key];
    const error = validateField(field, value);
    if (error) {
      errors.push({ field: `metadata.${field.key}`, message: error });
    }
  }

  for (const block of blocks) {
    if (!schema.allowedBlockTypes.includes(block.type)) {
      errors.push({
        field: `block.${block.id}`,
        message: `Block type "${block.type}" is not allowed`,
      });
    }
  }

  return errors;
}

/**
 * Publish-time validation. Stricter than draft-saving (validates slug format
 * and block types) but more lenient than full client-side validation
 * (does NOT require metadata fields that the user may not have filled yet).
 *
 * What IS enforced:
 * - Title non-empty (publishing an untitled document is never valid)
 * - Slug non-empty and valid format (the slug becomes a public URL)
 * - Block types are all within the schema's allowed list (structural integrity)
 * - Metadata values that ARE present must have valid format (e.g., if
 *   accentColor is set, it must be valid hex; if logo is set, must be a
 *   valid URL). This catches corrupt data without requiring empty fields.
 *
 * What is NOT enforced:
 * - Required metadata fields (tagline, summary, etc.) — the editor validates
 *   these incrementally, and a user may publish a partial project intentionally.
 *   The client-side UI blocks this; the server trusts that published documents
 *   went through the editor.
 */
export function validateForPublish(
  schema: ContentSchema,
  title: string,
  slug: string,
  metadata: DocumentMetadata,
  blocks: DocumentBlock[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!title.trim()) {
    errors.push({ field: "title", message: "Title is required" });
  }

  if (!slug.trim()) {
    errors.push({ field: "slug", message: "Slug is required" });
  } else if (!slugIsValid(slug)) {
    errors.push({
      field: "slug",
      message:
        "Slug must contain only lowercase letters, numbers, and hyphens",
    });
  }

  // Validate format of metadata fields that ARE present, but do not require
  // fields that are missing. This catches corrupt values (e.g. invalid hex
  // color, invalid URL) without blocking partial documents.
  for (const field of schema.metadataFields) {
    const value = metadata[field.key];
    if (value === undefined || value === null || value === "") continue;
    const error = validateField(field, value);
    if (error) {
      errors.push({ field: `metadata.${field.key}`, message: error });
    }
  }

  for (const block of blocks) {
    if (!schema.allowedBlockTypes.includes(block.type)) {
      errors.push({
        field: `block.${block.id}`,
        message: `Block type "${block.type}" is not allowed`,
      });
    }
  }

  return errors;
}
