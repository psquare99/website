import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createBlock,
  duplicateBlock,
  moveBlockUp,
  moveBlockDown,
  insertBlock,
  removeBlock,
  updateBlockData,
} from "../editor/block-utils";

describe("block-utils", () => {
  it("createBlock creates a paragraph with empty text", () => {
    const block = createBlock("paragraph");
    assert.equal(block.type, "paragraph");
    assert.equal(block.data.text, "");
    assert.ok(block.id);
    assert.equal(typeof block.id, "string");
    assert.ok(block.id.length > 0);
  });

  it("createBlock creates a heading with level", () => {
    const block = createBlock("heading");
    assert.equal(block.type, "heading");
    assert.equal(block.data.level, 2);
  });

  it("createBlock creates a quote", () => {
    const block = createBlock("quote");
    assert.equal(block.type, "quote");
    assert.equal(block.data.text, "");
  });

  it("createBlock creates an image", () => {
    const block = createBlock("image");
    assert.equal(block.type, "image");
    assert.equal(block.data.src, "");
    assert.equal(block.data.alt, "");
  });

  it("duplicateBlock generates a new ID", () => {
    const original = createBlock("paragraph");
    original.data.text = "Hello world";
    const dup = duplicateBlock(original);
    assert.notEqual(dup.id, original.id);
    assert.equal(dup.type, original.type);
    assert.equal(dup.data.text, "Hello world");
  });

  it("duplicateBlock deep-copies data", () => {
    const original = createBlock("image");
    original.data.src = "test.jpg";
    const dup = duplicateBlock(original);
    dup.data.src = "changed.jpg";
    assert.equal(original.data.src, "test.jpg");
  });

  it("moveBlockUp swaps blocks", () => {
    const blocks = [
      createBlock("paragraph"),
      createBlock("heading"),
      createBlock("quote"),
    ];
    const result = moveBlockUp(blocks, 1);
    assert.equal(result[0].type, "heading");
    assert.equal(result[1].type, "paragraph");
    assert.equal(result[2].type, "quote");
  });

  it("moveBlockUp does nothing at index 0", () => {
    const blocks = [createBlock("paragraph"), createBlock("heading")];
    const result = moveBlockUp(blocks, 0);
    assert.equal(result, blocks);
  });

  it("moveBlockDown swaps blocks", () => {
    const blocks = [
      createBlock("paragraph"),
      createBlock("heading"),
      createBlock("quote"),
    ];
    const result = moveBlockDown(blocks, 0);
    assert.equal(result[0].type, "heading");
    assert.equal(result[1].type, "paragraph");
  });

  it("moveBlockDown does nothing at last index", () => {
    const blocks = [createBlock("paragraph"), createBlock("heading")];
    const result = moveBlockDown(blocks, 1);
    assert.equal(result, blocks);
  });

  it("insertBlock appends when no afterIndex", () => {
    const blocks = [createBlock("paragraph")];
    const result = insertBlock(blocks, "heading");
    assert.equal(result.length, 2);
    assert.equal(result[1].type, "heading");
  });

  it("insertBlock inserts after specified index", () => {
    const blocks = [
      createBlock("paragraph"),
      createBlock("heading"),
    ];
    const result = insertBlock(blocks, "quote", 0);
    assert.equal(result.length, 3);
    assert.equal(result[0].type, "paragraph");
    assert.equal(result[1].type, "quote");
    assert.equal(result[2].type, "heading");
  });

  it("removeBlock removes by ID", () => {
    const a = createBlock("paragraph");
    const b = createBlock("heading");
    const result = removeBlock([a, b], a.id);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, b.id);
  });

  it("updateBlockData merges data", () => {
    const block = createBlock("heading");
    block.data.text = "Original";
    block.data.level = 3;
    const result = updateBlockData([block], block.id, { text: "Changed" });
    assert.equal(result[0].data.text, "Changed");
    assert.equal(result[0].data.level, 3);
  });

  it("all blocks get unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(createBlock("paragraph").id);
    }
    assert.equal(ids.size, 100);
  });
});
