/**
 * Media URL optimization helper for Cloudflare Edge Image Transformations.
 *
 * Converts R2 storage URLs (both historical pub-*.r2.dev and media.thelongwayhome.dev)
 * to Cloudflare Image Transformation URLs (https://media.thelongwayhome.dev/cdn-cgi/image/...).
 *
 * Preserves SVGs, local paths, and external third-party URLs untouched.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, defaults to 85
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  format?: "auto" | "webp" | "avif" | "json";
}

const R2_HOST_PATTERN = /^(?:pub-[a-zA-Z0-9]+\.r2\.dev|media\.thelongwayhome\.dev)$/i;
const CUSTOM_MEDIA_ORIGIN = "https://media.thelongwayhome.dev";

export function getOptimizedImageUrl(
  src: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!src) return "";

  const trimmed = src.trim();
  if (!trimmed) return "";

  // 1. SVGs must not be rasterized or transformed
  if (trimmed.toLowerCase().endsWith(".svg") || trimmed.toLowerCase().includes(".svg?")) {
    return trimmed;
  }

  // 2. Relative or local paths pass through untouched
  if (trimmed.startsWith("/") || (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    // 3. Check if domain is one of our R2 hosts
    if (!R2_HOST_PATTERN.test(url.hostname)) {
      // External third-party URL — pass through untouched
      return trimmed;
    }

    // 4. If URL is already a /cdn-cgi/image/ transformation URL, return as-is
    if (url.pathname.startsWith("/cdn-cgi/image/")) {
      return trimmed;
    }

    // Extract path e.g. /uploads/123.jpg -> uploads/123.jpg
    const imagePath = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    if (!imagePath) return trimmed;

    // Build transformation parameters
    const params: string[] = [];
    if (options.width && options.width > 0) {
      params.push(`width=${Math.round(options.width)}`);
    }
    if (options.height && options.height > 0) {
      params.push(`height=${Math.round(options.height)}`);
    }
    const quality = options.quality ?? 85;
    if (quality > 0 && quality <= 100) {
      params.push(`quality=${Math.round(quality)}`);
    }
    if (options.fit) {
      params.push(`fit=${options.fit}`);
    }
    const format = options.format ?? "auto";
    params.push(`format=${format}`);

    const transformPrefix = params.join(",");
    return `${CUSTOM_MEDIA_ORIGIN}/cdn-cgi/image/${transformPrefix}/${imagePath}`;
  } catch {
    // If URL parsing fails, fallback to original string
    return trimmed;
  }
}
