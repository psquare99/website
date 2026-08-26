import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeFingerprint, type EditorState } from "../editor/editor-types";

describe("editor-types", () => {
  it("computeFingerprint produces consistent output", () => {
    const state: EditorState = {
      id: "abc",
      title: "Test",
      slug: "test",
      metadata: { category: "tech" },
      blocks: [{ id: "b1", type: "paragraph", data: { text: "hello" } }],
    };
    const fp1 = computeFingerprint(state);
    const fp2 = computeFingerprint(state);
    assert.equal(fp1, fp2);
  });

  it("different states produce different fingerprints", () => {
    const a: EditorState = {
      id: "abc",
      title: "Test",
      slug: "test",
      metadata: {},
      blocks: [],
    };
    const b: EditorState = {
      ...a,
      title: "Changed",
    };
    assert.notEqual(computeFingerprint(a), computeFingerprint(b));
  });

  it("detects metadata changes", () => {
    const a: EditorState = {
      id: "abc",
      title: "Test",
      slug: "test",
      metadata: { category: "tech" },
      blocks: [],
    };
    const b: EditorState = {
      ...a,
      metadata: { category: "travel" },
    };
    assert.notEqual(computeFingerprint(a), computeFingerprint(b));
  });

  it("detects block changes", () => {
    const a: EditorState = {
      id: "abc",
      title: "Test",
      slug: "test",
      metadata: {},
      blocks: [{ id: "b1", type: "paragraph", data: { text: "hello" } }],
    };
    const b: EditorState = {
      ...a,
      blocks: [{ id: "b1", type: "paragraph", data: { text: "world" } }],
    };
    assert.notEqual(computeFingerprint(a), computeFingerprint(b));
  });
});
