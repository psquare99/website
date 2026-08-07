import type { Project } from "@/types/project";

export const prime: Project = {
  slug: "prime",

  title: "Prime",

  tagline: "Track. Grow. Prosper.",

  Category: "App",

  status: "completed",

  accentColor: "#3B82F6",

  logo: "/images/projects/prime/logo.png",

  primaryImage:
    "/images/projects/prime/primary.png",

  secondaryImage:
    "/images/projects/prime/secondary.png",

  github:
    "https://github.com/psquare99/Prime",

  gallery:
    "/projects/prime/gallery",

  overview:
    "Prime is a modern, privacy-first personal net worth manager built with Flutter. It helps you track assets, liabilities and net worth entirely on your device without relying on cloud services.",

  why:
    "Prime began as a learning project to explore Flutter, but quickly evolved into a polished personal finance app. The goal was simple: build a beautiful, offline-first experience focused on helping people understand what they own and what they owe.",

  techStack: [
    "Flutter",
    "Hive CE",
    "Provider",
    "Material 3",
  ],

  features: [
    "Net Worth Dashboard",
    "Asset Management",
    "Liability Management",
    "Financial Insights",
    "Offline-first Storage",
    "Profile Management",
    "Privacy Focused",
  ],

  lessons: [
    "Designed reusable Flutter widgets and layouts.",
    "Built a clean repository-based architecture.",
    "Learned local persistence with Hive CE.",
    "Improved state management using Provider.",
    "Shipped and maintained a complete production-ready Flutter application.",
  ],

  platform: "Android",

  framework: "Flutter",

  started: "July 2026",

  repository: "public",

  version: "v1.0.0",

  roadmap: [
    "Net Worth History",
    "Charts & Trends",
    "Goals & Milestones",
    "Cloud Backup & Sync",
    "Home Screen Widgets",
    "Multi-Currency Support",
  ],

  summary:
    "A modern, offline-first personal finance app for tracking assets, liabilities and net worth with complete privacy.",
};