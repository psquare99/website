import type { Project } from "@/types/project";

export const journalPublisher: Project = {
  slug: "journal-publisher",

  title: "Journal Publisher",

  tagline: "Write. Publish. Keep going.",

  Category: "App",

  status: "completed",

  accentColor: "#8B5E1A",

  logo: "/images/projects/journal-publisher/journal_publisher_icon.png",
  primaryImage: "/images/projects/journal-publisher/primary.png",
  secondaryImage: "/images/projects/journal-publisher/primary.png",


  github:
    "https://github.com/psquare99/journal-publisher",

  overview:
    "Journal Publisher is a personal publishing app built with Flutter. It lets me write, edit, organize and publish journal posts directly from my phone or tablet.",

  why:
    "I wanted a simple way to publish to my own website without depending on a traditional CMS. The app connects directly to a small publishing backend, which commits posts and images to GitHub and lets Cloudflare Pages handle the live website.",

  techStack: [
    "Flutter",
    "Dart",
    "Cloudflare Workers",
    "GitHub",
    "Cloudflare Pages",
  ],

  features: [
    "Rich Text Editor",
    "Create & Publish Posts",
    "Edit Published Posts",
    "Delete Published Posts",
    "Category Management",
    "Image Uploads",
    "Draft Support",
    "Direct Website Publishing",
  ],

  lessons: [
    "Built a complete publishing workflow from a mobile app to a live website.",
    "Learned how to use Cloudflare Workers as a lightweight publishing API.",
    "Built GitHub-based content publishing without a traditional CMS.",
    "Handled rich text and image serialization between Flutter and the website.",
    "Designed the system around actually using it rather than building features for their own sake.",
  ],

  platform: "Android",

  framework: "Flutter",

  started: "August 2026",

  repository: "private",

  version: "v1.0.0",

  roadmap: [],

  summary:
    "A personal Flutter publishing app for writing and managing journal posts directly from Android and publishing them to my own website.",
};