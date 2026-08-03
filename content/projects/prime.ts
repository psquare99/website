import type { Project } from "@/types/project";

export const prime: Project = {
  slug: "prime",

  title: "Prime",

  tagline: "Personal net worth manager",

  Category: "App",

  status: "building",

  accentColor: "#3B82F6",

  logo: "/images/projects/prime/logo.png",

primaryImage:
"/images/projects/prime/primary.png",

secondaryImage:
"/images/projects/prime/secondary.png",

github:
"https://github.com/psquare99/prime",

gallery: "/projects/prime/gallery",


  overview:
    "Prime is a privacy-first personal net worth manager built with Flutter. It helps track assets, liabilities and overall net worth without relying on cloud services.",

  why:
    "I wanted to create a personal finance app that prioritizes user privacy and doesn't rely on cloud services. I also wanted to learn Flutter and explore local persistence with Hive.",
    
  techStack: [
    "Flutter",
    "Hive",
    "Provider",
    "Material 3",
  ],

  features: [
    "Track assets and liabilities",
    "Automatic net worth calculation",
    "Offline-first storage",
    "Minimal and clean interface",
  ],

  lessons: [
    "Designed reusable Flutter components.",
    "Learned local persistence with Hive.",
    "Improved application architecture using repositories.",
  ],
  platform: "Android",

framework: "Flutter",

started: "July 2026",

repository: "private",

version: "v0.8.0",

roadmap: [
  "Goal-based savings",
  "Charts & analytics",
  "Data backup & restore",
  "Desktop version",
],
summary:
  "A privacy-first personal finance app that helps track assets, liabilities and net worth without relying on cloud services.",
};