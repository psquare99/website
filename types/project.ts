export type ProjectStatus =
  | "building"
  | "paused"
  | "completed";

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
}