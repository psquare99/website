import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSchema } from "../editor/schemas";

describe("content-type schemas", () => {
  it("journal schema has correct structure", () => {
    const schema = getSchema("journal");
    assert.equal(schema.contentType, "journal");
    assert.equal(schema.label, "Journal");
    assert.ok(schema.allowedBlockTypes.includes("paragraph"));
    assert.ok(schema.allowedBlockTypes.includes("heading"));
    assert.ok(schema.allowedBlockTypes.includes("quote"));
    assert.ok(schema.allowedBlockTypes.includes("image"));
    assert.equal(schema.requiredMetadataKeys.length, 0);
  });

  it("project schema requires correct fields", () => {
    const schema = getSchema("project");
    assert.equal(schema.contentType, "project");
    const required = schema.metadataFields.filter((f) => f.required);
    const requiredKeys = required.map((f) => f.key);
    assert.ok(requiredKeys.includes("tagline"));
    assert.ok(requiredKeys.includes("summary"));
    assert.ok(requiredKeys.includes("category"));
    assert.ok(requiredKeys.includes("status"));
    assert.ok(requiredKeys.includes("overview"));
    assert.ok(requiredKeys.includes("why"));
    assert.ok(requiredKeys.includes("version"));
    assert.ok(requiredKeys.includes("accentColor"));
    assert.ok(requiredKeys.includes("logo"));
    assert.ok(requiredKeys.includes("primaryImage"));
  });

  it("project schema has select fields with options", () => {
    const schema = getSchema("project");
    const categoryField = schema.metadataFields.find(
      (f) => f.key === "category"
    );
    assert.ok(categoryField);
    assert.equal(categoryField.type, "select");
    assert.ok(categoryField.options);
    assert.ok(categoryField.options!.length > 0);
  });

  it("project schema has image fields", () => {
    const schema = getSchema("project");
    const imageFields = schema.metadataFields.filter((f) => f.type === "image");
    assert.ok(imageFields.length >= 2);
    const imageKeys = imageFields.map((f) => f.key);
    assert.ok(imageKeys.includes("logo"));
    assert.ok(imageKeys.includes("primaryImage"));
  });

  it("page schema has minimal fields", () => {
    const schema = getSchema("page");
    assert.equal(schema.contentType, "page");
    assert.equal(schema.metadataFields.length, 2);
    const keys = schema.metadataFields.map((f) => f.key);
    assert.ok(keys.includes("description"));
    assert.ok(keys.includes("navigationLabel"));
    assert.equal(schema.requiredMetadataKeys.length, 0);
  });

  it("page schema allows standard block types", () => {
    const schema = getSchema("page");
    assert.ok(schema.allowedBlockTypes.includes("paragraph"));
    assert.ok(schema.allowedBlockTypes.includes("heading"));
    assert.ok(schema.allowedBlockTypes.includes("quote"));
    assert.ok(schema.allowedBlockTypes.includes("image"));
  });
});
