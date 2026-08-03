export type ProjectCategory =
  | "App"
  | "Website"
  | "Game"
  | "Tool"
  | "Experiment";

export type ProjectStatus =
  | "building"
  | "completed"
  | "archived";
export interface Project {
  slug: string;

  title: string;
  tagline: string;
  summary: string;

  logo: string;

  primaryImage: string;
  secondaryImage: string;

  Category: ProjectCategory;
  status: ProjectStatus;

  overview: string;

  why: string;

  techStack: string[];

  features: string[];

  challenges?: string[];

  lessons: string[];

  github?: string;

  gallery?: string;

  liveDemo?: string;

  platform?: string;

framework?: string;

started?: string;

repository?: "public" | "private";

accentColor: string;

roadmap: string[];
version: string;

}