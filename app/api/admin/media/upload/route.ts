import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createMediaAsset } from "@/lib/repository/media";
import type { MediaAsset } from "@/lib/domain/document";

const ACCEPTED_TYPES: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "image/svg+xml": ["svg"],
};
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Normalize a file extension by stripping the leading dot and lowercasing.
 */
function normalizeExt(name: string): string {
  const parts = name.split(".");
  return (parts.length > 1 ? parts.pop()! : "bin").toLowerCase();
}

export async function POST(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return jsonError("No file provided", 400);
  }

  if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
    return jsonError(
      `Unsupported file type: ${file.type}. Accepted: ${Object.keys(ACCEPTED_TYPES).join(", ")}`,
      400
    );
  }

  if (file.size > MAX_SIZE) {
    return jsonError(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 10MB`,
      400
    );
  }

  // Validate file extension matches MIME type.
  // Prevents a file named "foo.exe" with MIME "image/png" from being stored
  // with an executable extension. This is defense-in-depth — R2 serves via
  // the stored contentType, not the extension, but correct extensions reduce
  // confusion during manual inspection.
  const ext = normalizeExt(file.name);
  const allowedExts = ACCEPTED_TYPES[file.type];
  if (!allowedExts.includes(ext)) {
    return jsonError(
      `File extension ".${ext}" does not match MIME type "${file.type}". ` +
        `Expected one of: ${allowedExts.map((e) => `.${e}`).join(", ")}`,
      400
    );
  }

  const id = generateId();
  const storageKey = `uploads/${id}.${ext}`;

  const { env } = getCloudflareContext();
  const bucket = (env as CloudflareEnv).MEDIA_BUCKET;

  const arrayBuffer = await file.arrayBuffer();

  await bucket.put(storageKey, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  // SVG SECURITY ASSUMPTION:
  // SVG files are stored in R2 and served via R2's CDN. Cloudflare R2 serves
  // files with the correct Content-Type based on the httpMetadata we set
  // (image/svg+xml for SVGs). When served with image/svg+xml, browsers treat
  // SVGs as images and do NOT execute embedded <script> tags. This is safe
  // as long as: (a) images are rendered via <img src="..."> tags (which our
  // block-renderer.tsx does), and (b) SVGs are never served with text/html
  // Content-Type. If either assumption changes, this must be revisited.
  const r2PublicBase = (env as CloudflareEnv).R2_PUBLIC_URL_BASE;
  if (!r2PublicBase) {
    console.error("R2_PUBLIC_URL_BASE is not configured");
    return jsonError("Media storage is not properly configured", 500);
  }
  const publicUrl = `${r2PublicBase}/${storageKey}`;
  const now = new Date().toISOString();

  const asset: MediaAsset = {
    id,
    storageKey,
    publicUrl,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    alt: file.name,
    createdAt: now,
  };

  try {
    await createMediaAsset((env as CloudflareEnv).CONTENT_DB, asset);
  } catch (d1Error) {
    // D1 write failed after R2 write succeeded. The R2 object is orphaned
    // but recoverable via future cleanup. We do NOT roll back R2 because:
    // 1. R2 rollback adds complexity (must catch, then delete, then handle
    //    rollback failure which would be worse than the orphan).
    // 2. Orphaned R2 objects are cheap and don't break any application logic.
    // 3. The D1 record is the source of truth — without it, the asset is
    //    invisible to the application regardless of R2 state.
    console.warn(
      `R2 object uploaded but D1 record creation failed for ${storageKey}:`,
      d1Error
    );
  }

  return Response.json({
    url: publicUrl,
    storageKey,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  }, { status: 201 });
}
