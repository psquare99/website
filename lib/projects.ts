import { projects } from "@/content/projects";

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}