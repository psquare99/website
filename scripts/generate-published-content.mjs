import fs from "node:fs";
import path from "node:path";

import {
  validateProjectDocument,
  formatValidationErrors,
} from "./lib/validate-project-document.mjs";

const root = process.cwd();

const journalDirectory = path.join(
  root,
  "content",
  "published",
  "journal"
);

const projectDirectory = path.join(
  root,
  "content",
  "published",
  "project"
);

function readPublishedDirectory(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const filePath = path.join(
        directory,
        file
      );

      return {
        file,
        data: JSON.parse(
          fs.readFileSync(
            filePath,
            "utf-8"
          )
        ),
      };
    });
}

const journals =
  readPublishedDirectory(
    journalDirectory
  ).map((entry) => entry.data);

const projectEntries = readPublishedDirectory(projectDirectory);

let hasValidationErrors = false;

for (const entry of projectEntries) {
  const result = validateProjectDocument(entry.data);

  if (!result.ok) {
    hasValidationErrors = true;

    for (const message of formatValidationErrors(entry.data, entry.file, result.errors)) {
      console.error(message);
    }
  }
}

if (hasValidationErrors) {
  throw new Error(
    "Published project validation failed. Fix the errors above and rebuild."
  );
}

const projects =
  projectEntries.map((entry) => entry.data);

if (projects.length === 0) {
  throw new Error(
    "No published projects were found. Refusing to build an empty project site."
  );
}

const outputDirectory = path.join(
  root,
  "lib",
  "publishing",
  "generated"
);

const outputFile = path.join(
  outputDirectory,
  "published-content.ts"
);

fs.mkdirSync(
  outputDirectory,
  {
    recursive: true,
  }
);

const output = `// AUTO-GENERATED FILE.
// Do not edit manually.

import type { PublishedDocument } from "../journal-adapter";
import type { PublishedProjectDocument } from "../project-adapter";

export const publishedJournals =
${JSON.stringify(journals, null, 2)} as const satisfies readonly PublishedDocument[];

export const publishedProjects =
${JSON.stringify(projects, null, 2)} as const satisfies readonly PublishedProjectDocument[];
`;

fs.writeFileSync(
  outputFile,
  output,
  "utf-8"
);

console.log(
  `Generated published content: ${journals.length} journals, ${projects.length} projects.`
);