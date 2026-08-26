import { getPublishedProjects, getPublishedProject } from "@/lib/publishing/public-read";

export async function getProjects() {
  return getPublishedProjects();
}

export async function getProject(slug: string) {
  return getPublishedProject(slug);
}
