import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateDocument, validateForPublish, type ValidationError } from "../editor/validation";
import { getSchema } from "../editor/schemas";
import { createBlock } from "../editor/block-utils";
import type { DocumentMetadata } from "../domain/document";

describe("validation", () => {
  it("validates empty title", () => {
    const schema = getSchema("journal");
    const errors = validateDocument(schema, "", "my-slug", {}, []);
    assert.ok(errors.some((e) => e.field === "title"));
  });

  it("validates empty slug", () => {
    const schema = getSchema("journal");
    const errors = validateDocument(schema, "My Title", "", {}, []);
    assert.ok(errors.some((e) => e.field === "slug"));
  });

  it("validates invalid slug format", () => {
    const schema = getSchema("journal");
    const errors = validateDocument(schema, "My Title", "My Title!", {}, []);
    const slugError = errors.find((e) => e.field === "slug");
    assert.ok(slugError);
    assert.ok(slugError!.message.includes("lowercase"));
  });

  it("accepts valid slug", () => {
    const schema = getSchema("journal");
    const errors = validateDocument(schema, "My Title", "my-title", {}, []);
    const slugError = errors.find((e) => e.field === "slug");
    assert.equal(slugError, undefined);
  });

  it("validates required project metadata", () => {
    const schema = getSchema("project");
    const errors = validateDocument(
      schema,
      "Project",
      "project",
      {},
      []
    );
    const requiredErrors = errors.filter((e) =>
      e.field.startsWith("metadata.")
    );
    assert.ok(requiredErrors.length > 0);
  });

  it("passes validation with all required project fields", () => {
    const schema = getSchema("project");
    const metadata: DocumentMetadata = {
      tagline: "A tagline",
      summary: "A summary",
      category: "App",
      status: "building",
      overview: "Overview text",
      why: "Why text",
      version: "1.0.0",
      accentColor: "#000000",
      logo: "https://example.com/logo.png",
      primaryImage: "https://example.com/image.png",
    };
    const errors = validateDocument(schema, "Project", "project", metadata, []);
    const requiredErrors = errors.filter((e) =>
      e.field.startsWith("metadata.")
    );
    assert.equal(requiredErrors.length, 0);
  });

  it("validates image URLs", () => {
    const schema = getSchema("project");
    const metadata: DocumentMetadata = {
      logo: "not-a-url",
      tagline: "tag",
      summary: "sum",
      category: "App",
      status: "building",
      overview: "ov",
      why: "why",
      version: "1.0",
      accentColor: "#000",
      primaryImage: "img.jpg",
    };
    const errors = validateDocument(schema, "P", "p", metadata, []);
    const imageErrors = errors.filter((e) =>
      e.message.includes("valid image URL")
    );
    assert.ok(imageErrors.length >= 2);
  });

  it("validates hex color", () => {
    const schema = getSchema("project");
    const errors = validateDocument(
      schema,
      "P",
      "p",
      { accentColor: "not-hex" },
      []
    );
    const colorError = errors.find((e) => e.field === "metadata.accentColor");
    assert.ok(colorError);
  });

  it("validates select options", () => {
    const schema = getSchema("project");
    const errors = validateDocument(
      schema,
      "P",
      "p",
      { status: "invalid-status" },
      []
    );
    const statusError = errors.find((e) => e.field === "metadata.status");
    assert.ok(statusError);
  });

  it("validates allowed block types", () => {
    const schema = getSchema("journal");
    const badBlock = createBlock("paragraph");
    badBlock.type = "custom-block" as "paragraph";
    const errors = validateDocument(schema, "T", "t", {}, [badBlock]);
    assert.ok(errors.some((e) => e.field.startsWith("block.")));
  });

  it("collects multiple errors", () => {
    const schema = getSchema("journal");
    const errors = validateDocument(schema, "", "", {}, []);
    assert.ok(errors.length >= 2);
  });

  // --- validateForPublish tests ---

  it("validateForPublish: rejects empty title", () => {
    const schema = getSchema("journal");
    const errors = validateForPublish(schema, "", "my-slug", {}, []);
    assert.ok(errors.some((e) => e.field === "title"));
  });

  it("validateForPublish: rejects empty slug", () => {
    const schema = getSchema("journal");
    const errors = validateForPublish(schema, "Title", "", {}, []);
    assert.ok(errors.some((e) => e.field === "slug"));
  });

  it("validateForPublish: rejects invalid slug format", () => {
    const schema = getSchema("journal");
    const errors = validateForPublish(schema, "Title", "My Title!", {}, []);
    assert.ok(errors.some((e) => e.field === "slug"));
  });

  it("validateForPublish: does NOT require project metadata fields", () => {
    const schema = getSchema("project");
    const errors = validateForPublish(schema, "Project", "project", {}, []);
    const metadataErrors = errors.filter((e) => e.field.startsWith("metadata."));
    assert.equal(metadataErrors.length, 0, "should not require missing metadata fields for publish");
  });

  it("validateForPublish: validates format of present metadata fields", () => {
    const schema = getSchema("project");
    const metadata: DocumentMetadata = {
      accentColor: "not-hex",
      logo: "not-a-url",
    };
    const errors = validateForPublish(schema, "Project", "project", metadata, []);
    assert.ok(errors.some((e) => e.field === "metadata.accentColor"), "should reject invalid hex color");
    assert.ok(errors.some((e) => e.field === "metadata.logo"), "should reject invalid image URL");
  });

  it("validateForPublish: rejects invalid block types", () => {
    const schema = getSchema("journal");
    const badBlock = createBlock("paragraph");
    badBlock.type = "custom-block" as "paragraph";
    const errors = validateForPublish(schema, "T", "t", {}, [badBlock]);
    assert.ok(errors.some((e) => e.field.startsWith("block.")));
  });

  it("validateForPublish: accepts valid document with no metadata", () => {
    const schema = getSchema("journal");
    const errors = validateForPublish(schema, "My Post", "my-post", {}, []);
    assert.equal(errors.length, 0);
  });
});
