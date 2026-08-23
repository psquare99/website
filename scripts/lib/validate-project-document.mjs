import path from "node:path";

const REQUIRED_FIELDS = [
  "title",
  "tagline",
  "summary",
  "category",
  "status",
  "accentColor",
  "logo",
  "primaryImage",
  "overview",
  "why",
  "version",
];

const IMAGE_FIELDS = [
  "logo",
  "primaryImage",
  "secondaryImage",
  "indexImage",
];

function getString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidImageValue(value) {
  if (value.startsWith("/")) {
    return true;
  }

  return /^https?:\/\//i.test(value);
}

/**
 * Syntactic validation of a published project document.
 *
 * Purely local: no network requests, no resource resolution.
 * Returns { ok: true } or { ok: false, errors: [{ field, reason }] }.
 */
export function validateProjectDocument(document) {
  const errors = [];

  if (
    typeof document !== "object" ||
    document === null ||
    Array.isArray(document)
  ) {
    return {
      ok: false,
      errors: [{ field: "(document)", reason: "must be a JSON object" }],
    };
  }

  if (document.contentType !== "project") {
    errors.push({
      field: "contentType",
      reason: `must be "project" (got ${JSON.stringify(document.contentType ?? null)})`,
    });
  }

  if (!getString(document.slug)) {
    errors.push({
      field: "slug",
      reason: "required field is missing or empty",
    });
  }

  const metadata =
    typeof document.metadata === "object" && document.metadata !== null
      ? document.metadata
      : {};

  if (typeof document.metadata !== "object" || document.metadata === null) {
    errors.push({
      field: "metadata",
      reason: "must be a JSON object",
    });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!getString(metadata[field])) {
      errors.push({
        field,
        reason: "required field is missing or empty",
      });
    }
  }

  for (const field of IMAGE_FIELDS) {
    const value = getString(metadata[field]);

    if (!value) {
      // indexImage is optional; all other image fields are covered by the
      // required-field loop above.
      continue;
    }

    if (!isValidImageValue(value)) {
      errors.push({
        field,
        reason:
          "must be a root-relative path starting with '/' or an http:// / https:// URL",
      });
    }
  }

  if (errors.length === 0) {
    return { ok: true };
  }

  return { ok: false, errors };
}

export function formatValidationErrors(document, file, errors) {
  const slug =
    typeof document === "object" && document !== null
      ? String(document.slug ?? "(unknown slug)")
      : "(unknown slug)";

  return errors.map(
    (error) =>
      `Invalid published project "${slug}" (${path.basename(file)}): ${error.field}: ${error.reason}`
  );
}
