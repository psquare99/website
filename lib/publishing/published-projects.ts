import "server-only";

import type { Project } from "@/types/project";

import {
  publishedProjects,
} from "./generated/published-content";

import {
  projectFromPublishedDocument,
} from "./project-adapter";

export function getPublishedProjects(): Project[] {
  return publishedProjects.map(
    (document) =>
      projectFromPublishedDocument(
        document
      )
  );
}