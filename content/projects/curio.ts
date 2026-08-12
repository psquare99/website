import type { Project } from "@/types/project";

export const curio: Project = {
  slug: "curio",
  title: "Curio",
  tagline: "Things you chose not to forget.",
  summary:
    "A quiet personal library for the things you choose not to forget.",

  logo: "/images/projects/curio/logo.png",
  primaryImage: "/images/projects/curio/logo.png",
  secondaryImage: "/images/projects/curio/logo.png",

  Category: "App",
  status: "building",

  accentColor: "#167A78",

  overview:
    "Curio is a personal library for the things you choose not to forget. Instead of asking you to organize everything with folders and tags, Curio explores how the things we save can become dynamic threads of curiosity that evolve and connect over time.",

  why:
    "Curio began with a simple question: what if saving something wasn't about organizing it, but simply about choosing not to lose it? The project explores a quieter, more personal way of keeping things from the internet and from everyday life.",

  techStack: [
    "Flutter",
    "Dart",
  ],

  features: [
    "Save anything worth remembering",
    "Dynamic Threads",
    "Automatic understanding",
    "Connections between Threads",
    "Flexible organization",
    "Privacy-first local storage",
  ],

  lessons: [
    "Exploring product philosophy before implementation.",
    "Designing a system around user intent rather than rigid organization.",
    "Exploring how saved things can form meaningful connections.",
  ],

  github: "https://github.com/psquare99/curio",

  platform: "Android",
  framework: "Flutter",
  started: "August 2026",
  repository: "private",
  version: "v0.1.0",

  roadmap: [
    "First Thread experience",
    "Local persistence",
    "Share-to-Curio",
    "Automatic metadata extraction",
    "Thread connections",
    "Search and rediscovery",
  ],
};