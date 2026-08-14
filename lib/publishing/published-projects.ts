import "server-only";

import fs from "node:fs";
import path from "node:path";

import type { Project } from "@/types/project";
import type { PublishedProjectDocument } from "./project-adapter";

import { projectFromPublishedDocument } from "./project-adapter";

const PUBLISHED_PROJECT_DIR = path.join(
  process.cwd(),
  "content",
  "published",
  "project"
);

function readPublishedProjectDocuments(): PublishedProjectDocument[] {
  if (!fs.existsSync(PUBLISHED_PROJECT_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(PUBLISHED_PROJECT_DIR)
    .filter((file) => file.endsWith(".json"));

  return files.map((file) => {
    const filePath = path.join(
      PUBLISHED_PROJECT_DIR,
      file
    );

    const raw = fs.readFileSync(
      filePath,
      "utf-8"
    );

    return JSON.parse(
      raw
    ) as PublishedProjectDocument;
  });
}

export function getPublishedProjects(): Project[] {
  const publishedDocuments =
    readPublishedProjectDocuments();

  return publishedDocuments.map(
    projectFromPublishedDocument
  );
}