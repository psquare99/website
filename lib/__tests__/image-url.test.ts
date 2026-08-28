import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getOptimizedImageUrl } from "@/lib/media/url";

describe("getOptimizedImageUrl", () => {
  const HISTORICAL_R2_URL = "https://pub-cf03fb0406654b30a8f4535e5e423f54.r2.dev/uploads/test-image-123.jpg";
  const NEW_MEDIA_URL = "https://media.thelongwayhome.dev/uploads/test-image-456.png";

  it("projects historical pub-*.r2.dev URLs to Cloudflare edge transformation URLs", () => {
    const result = getOptimizedImageUrl(HISTORICAL_R2_URL, { width: 800 });
    assert.equal(
      result,
      "https://media.thelongwayhome.dev/cdn-cgi/image/width=800,quality=85,format=auto/uploads/test-image-123.jpg"
    );
  });

  it("projects new media.thelongwayhome.dev URLs to Cloudflare edge transformation URLs", () => {
    const result = getOptimizedImageUrl(NEW_MEDIA_URL, { width: 1200, quality: 90 });
    assert.equal(
      result,
      "https://media.thelongwayhome.dev/cdn-cgi/image/width=1200,quality=90,format=auto/uploads/test-image-456.png"
    );
  });

  it("supports custom height, fit, and format options", () => {
    const result = getOptimizedImageUrl(HISTORICAL_R2_URL, {
      width: 600,
      height: 400,
      fit: "cover",
      format: "webp",
      quality: 80,
    });
    assert.equal(
      result,
      "https://media.thelongwayhome.dev/cdn-cgi/image/width=600,height=400,quality=80,fit=cover,format=webp/uploads/test-image-123.jpg"
    );
  });

  it("passes SVGs through untouched regardless of domain", () => {
    const r2Svg = "https://pub-cf03fb0406654b30a8f4535e5e423f54.r2.dev/uploads/icon.svg";
    const mediaSvg = "https://media.thelongwayhome.dev/uploads/diagram.svg?v=1";
    assert.equal(getOptimizedImageUrl(r2Svg, { width: 800 }), r2Svg);
    assert.equal(getOptimizedImageUrl(mediaSvg, { width: 800 }), mediaSvg);
  });

  it("passes local relative paths through untouched", () => {
    const local1 = "/images/projects/prime/about.png";
    const local2 = "images/hero.jpg";
    assert.equal(getOptimizedImageUrl(local1, { width: 800 }), local1);
    assert.equal(getOptimizedImageUrl(local2, { width: 800 }), local2);
  });

  it("passes external third-party URLs through untouched", () => {
    const external = "https://images.unsplash.com/photo-123456789?auto=format";
    assert.equal(getOptimizedImageUrl(external, { width: 800 }), external);
  });

  it("returns already-transformed Cloudflare URLs untouched without duplicate prefixes", () => {
    const alreadyTransformed =
      "https://media.thelongwayhome.dev/cdn-cgi/image/width=800,quality=85,format=auto/uploads/test-image-123.jpg";
    assert.equal(getOptimizedImageUrl(alreadyTransformed, { width: 1200 }), alreadyTransformed);
  });

  it("handles null, undefined, empty, and whitespace strings safely", () => {
    assert.equal(getOptimizedImageUrl(null), "");
    assert.equal(getOptimizedImageUrl(undefined), "");
    assert.equal(getOptimizedImageUrl(""), "");
    assert.equal(getOptimizedImageUrl("   "), "");
  });

  it("handles default options with quality=85 and format=auto when width is omitted", () => {
    const result = getOptimizedImageUrl(HISTORICAL_R2_URL);
    assert.equal(
      result,
      "https://media.thelongwayhome.dev/cdn-cgi/image/quality=85,format=auto/uploads/test-image-123.jpg"
    );
  });
});
