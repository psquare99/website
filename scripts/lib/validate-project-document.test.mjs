import test from "node:test";
import assert from "node:assert/strict";

import {
  validateProjectDocument,
  formatValidationErrors,
} from "./validate-project-document.mjs";

function validDocument(overrides = {}) {
  return {
    contractVersion: "0.1",
    id: "test-id",
    contentType: "project",
    slug: "test-project",
    publishedAt: "2026-08-23T00:00:00.000Z",
    metadata: {
      slug: "test-project",
      title: "Test Project",
      tagline: "A test tagline",
      summary: "A test summary.",
      category: "App",
      status: "building",
      accentColor: "#167A78",
      logo: "/images/projects/test/logo.png",
      primaryImage: "/images/projects/test/primary.png",
      secondaryImage: "/images/projects/test/secondary.png",
      overview: "What it is.",
      why: "Why it exists.",
      techStack: ["Flutter"],
      features: ["Feature one"],
      lessons: ["Lesson one"],
      roadmap: ["Roadmap item"],
      version: "v0.1.0",
    },
    blocks: [],
    ...overrides,
  };
}

function errorsFor(document) {
  const result = validateProjectDocument(document);
  assert.equal(result.ok, false);
  return result.errors;
}

test("accepts a fully valid document", () => {
  const result = validateProjectDocument(validDocument());
  assert.deepEqual(result, { ok: true });
});

test("accepts a document without secondaryImage (optional)", () => {
  const doc = validDocument();
  delete doc.metadata.secondaryImage;
  const result = validateProjectDocument(doc);
  assert.deepEqual(result, { ok: true });
});

test("accepts an empty indexImage and an https R2 indexImage", () => {
  const emptyIndex = validDocument();
  emptyIndex.metadata.indexImage = "";
  assert.deepEqual(validateProjectDocument(emptyIndex), { ok: true });

  const r2Index = validDocument();
  r2Index.metadata.indexImage =
    "https://pub-example.r2.dev/media/2026/id.jpg";
  assert.deepEqual(validateProjectDocument(r2Index), { ok: true });
});

test("rejects a missing required field and names it", () => {
  const doc = validDocument();
  delete doc.metadata.title;
  const errors = errorsFor(doc);
  assert.ok(errors.some((e) => e.field === "title"));
});

test("rejects non-http(s), non-root-relative image values", () => {
  const ftpDoc = validDocument();
  ftpDoc.metadata.logo = "ftp://example.com/logo.png";
  assert.ok(errorsFor(ftpDoc).some((e) => e.field === "logo"));

  const slashlessDoc = validDocument();
  slashlessDoc.metadata.primaryImage = "images/projects/x/primary.png";
  assert.ok(errorsFor(slashlessDoc).some((e) => e.field === "primaryImage"));

  const jsDoc = validDocument();
  jsDoc.metadata.indexImage = "javascript:alert(1)";
  assert.ok(errorsFor(jsDoc).some((e) => e.field === "indexImage"));
});

test("rejects wrong contentType and missing slug", () => {
  const journalDoc = validDocument({ contentType: "journal" });
  assert.ok(errorsFor(journalDoc).some((e) => e.field === "contentType"));

  const noSlug = validDocument();
  delete noSlug.slug;
  assert.ok(errorsFor(noSlug).some((e) => e.field === "slug"));
});

test("aggregates multiple errors in one pass", () => {
  const doc = validDocument();
  delete doc.metadata.why;
  doc.metadata.logo = "http://ok.example.com/l.png";
  doc.metadata.secondaryImage = "not-a-url";
  const errors = errorsFor(doc);
  assert.equal(errors.length, 2);
  assert.deepEqual(
    errors.map((e) => e.field).sort(),
    ["secondaryImage", "why"]
  );
});

test("formatValidationErrors produces slug, file, field and reason", () => {
  const doc = validDocument();
  doc.slug = "broken";
  delete doc.metadata.version;
  const messages = formatValidationErrors(
    doc,
    "content/published/project/broken.json",
    errorsFor(doc)
  );
  assert.equal(messages.length, 1);
  assert.match(messages[0], /"broken"/);
  assert.match(messages[0], /broken\.json/);
  assert.match(messages[0], /version/);
});
