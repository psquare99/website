import type { Project } from "@/types/project";

export const statementAnalyzer: Project = {
  slug: "statement-analyzer",

  title: "Statement Analyzer",

  tagline: "Understand your spending automatically",

  Category: "App",

  status: "building",

  accentColor: "#8B5CF6",

  logo: "/images/projects/statement-analyzer/logo.png",

  primaryImage:
    "/images/projects/statement-analyzer/primary.png",

  secondaryImage:
    "/images/projects/statement-analyzer/secondary.png",

  github: "",

  gallery: "",

  overview:
    "A personal finance companion that automatically analyzes bank statements, categorizes transactions and transforms raw financial data into meaningful insights through beautiful visualizations.",

  why:
    "Managing personal finances shouldn't require manually going through hundreds of transactions. I wanted to build a tool that could instantly tell the story hidden inside a bank statement while helping me learn data visualization and financial analytics.",

  techStack: [
    "Flutter",
    "Hive",
    "SQLite",
    "Charts",
  ],

  features: [
    "Import bank statements",
    "Automatic expense categorization",
    "Interactive spending charts",
    "Monthly financial insights",
  ],

  lessons: [
    "Working with financial data.",
    "Designing data visualizations.",
    "Building parsing and analytics pipelines.",
  ],

  platform: "Android",

  framework: "Flutter",

  started: "August 2026",

  repository: "private",

  version: "v0.1.0",

  roadmap: [
    "Multi-bank support",
    "AI spending insights",
    "Budget planning",
    "Investment tracking",
  ],
  summary:
  "Import bank statements and instantly understand your spending through automatic categorization, beautiful charts and meaningful financial insights.",
};