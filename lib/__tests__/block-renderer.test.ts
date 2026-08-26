import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderBlocks, type Block } from "../publishing/block-renderer";

describe("block-renderer", () => {
  it("renders paragraph blocks", () => {
    const blocks: Block[] = [
      { id: "1", type: "paragraph", data: { text: "Hello world" } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
  });

  it("renders heading blocks", () => {
    const blocks: Block[] = [
      { id: "1", type: "heading", data: { text: "Title", level: 2 } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
  });

  it("renders quote blocks", () => {
    const blocks: Block[] = [
      { id: "1", type: "quote", data: { text: "A wise quote" } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
  });

  it("skips image blocks without src", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { alt: "no src" } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0], null);
  });

  it("renders image blocks with src", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "/img.jpg", alt: "photo" } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.ok(result[0] !== null);
  });

  it("returns null for unknown block types", () => {
    const blocks: Block[] = [
      { id: "1", type: "unknown", data: {} },
    ];
    const result = renderBlocks(blocks);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0], null);
  });

  it("handles empty blocks array", () => {
    const result = renderBlocks([]);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 0);
  });

  it("renders multiple blocks in order", () => {
    const blocks: Block[] = [
      { id: "1", type: "paragraph", data: { text: "First" } },
      { id: "2", type: "heading", data: { text: "Second" } },
      { id: "3", type: "paragraph", data: { text: "Third" } },
    ];
    const result = renderBlocks(blocks);
    assert.equal(result.length, 3);
  });

  it("handles blocks with missing data gracefully", () => {
    const blocks: Block[] = [
      { id: "1", type: "paragraph", data: {} },
      { id: "2", type: "heading", data: {} },
      { id: "3", type: "quote", data: {} },
    ];
    const result = renderBlocks(blocks);
    assert.equal(result.length, 3);
    assert.ok(result.every((r) => r !== undefined));
  });

  it("renders image blocks with https URL", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "https://pub-afd5b578ae094d339252bb77b1349f57.r2.dev/uploads/abc.jpg", alt: "photo" } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(result[0] !== null);
  });

  it("renders image blocks with http URL", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "http://example.com/img.jpg", alt: "photo" } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(result[0] !== null);
  });

  it("renders image blocks with root-relative path", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "/uploads/photo.png", alt: "photo" } },
    ];
    const result = renderBlocks(blocks);
    assert.ok(result[0] !== null);
  });

  it("filters image blocks with javascript: scheme (M9)", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "javascript:alert(1)", alt: "xss" } },
    ];
    const result = renderBlocks(blocks);
    assert.equal(result[0], null);
  });

  it("filters image blocks with data:text/html scheme (M9)", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "data:text/html,<script>alert(1)</script>", alt: "xss" } },
    ];
    const result = renderBlocks(blocks);
    assert.equal(result[0], null);
  });

  it("filters image blocks with vbscript: scheme (M9)", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "vbscript:MsgBox(1)", alt: "xss" } },
    ];
    const result = renderBlocks(blocks);
    assert.equal(result[0], null);
  });

  it("filters image blocks with empty src (M9)", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { src: "", alt: "empty" } },
    ];
    const result = renderBlocks(blocks);
    assert.equal(result[0], null);
  });
});
