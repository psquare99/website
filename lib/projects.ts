import { getPublishedProjects } from "@/lib/publishing/published-projects";

export function getProjects() {
  return getPublishedProjects();
}

export function getProject(slug: string) {
  return getProjects().find(
    (project) => project.slug === slug
  );
}