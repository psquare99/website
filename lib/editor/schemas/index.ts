import type { ContentType, DocumentBlock } from "@/lib/domain/document";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "boolean"
  | "list"
  | "date"
  | "image"
  | "color"
  | "url"
  | "number";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: SelectOption[];
  defaultValue?: string | number | boolean | string[];
  multiLine?: boolean;
}

export interface ContentSchema {
  contentType: ContentType;
  label: string;
  allowedBlockTypes: DocumentBlock["type"][];
  metadataFields: FieldSchema[];
  requiredMetadataKeys: string[];
}

export function getSchema(
  contentType: ContentType
): ContentSchema {
  switch (contentType) {
    case "journal":
      return JOURNAL_SCHEMA;
    case "project":
      return PROJECT_SCHEMA;
    case "page":
      return PAGE_SCHEMA;
  }
}

const JOURNAL_SCHEMA: ContentSchema = {
  contentType: "journal",
  label: "Journal",
  allowedBlockTypes: ["paragraph", "heading", "quote", "image"],
  requiredMetadataKeys: [],
  metadataFields: [
    {
      key: "category",
      label: "Category",
      type: "text",
      required: false,
      description: "Journal category for filtering",
      placeholder: "e.g. technology, travel, reflections",
    },
    {
      key: "excerpt",
      label: "Excerpt",
      type: "textarea",
      required: false,
      description: "Short summary shown in listing",
      multiLine: true,
    },
    {
      key: "location",
      label: "Location",
      type: "text",
      required: false,
      placeholder: "e.g. Dharchula, Himalayas",
    },
    {
      key: "featured",
      label: "Featured",
      type: "boolean",
      required: false,
      description: "Highlight this entry",
    },
    {
      key: "image",
      label: "Cover Image",
      type: "image",
      required: false,
      description: "Image shown in the listing card",
    },
  ],
};

const PROJECT_SCHEMA: ContentSchema = {
  contentType: "project",
  label: "Project",
  allowedBlockTypes: ["paragraph", "heading", "quote", "image"],
  requiredMetadataKeys: [
    "tagline",
    "summary",
    "category",
    "status",
    "overview",
    "why",
    "version",
    "accentColor",
    "logo",
    "primaryImage",
  ],
  metadataFields: [
    {
      key: "tagline",
      label: "Tagline",
      type: "text",
      required: true,
      description: "One-line project description",
    },
    {
      key: "summary",
      label: "Summary",
      type: "textarea",
      required: true,
      description: "Short project summary",
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "App", label: "App" },
        { value: "Website", label: "Website" },
        { value: "Game", label: "Game" },
        { value: "Tool", label: "Tool" },
        { value: "Experiment", label: "Experiment" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "building", label: "Building" },
        { value: "completed", label: "Completed" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "accentColor",
      label: "Accent Color",
      type: "color",
      required: true,
      description: "Project accent color (hex)",
    },
    {
      key: "logo",
      label: "Logo",
      type: "image",
      required: true,
    },
    {
      key: "primaryImage",
      label: "Primary Image",
      type: "image",
      required: true,
    },
    {
      key: "secondaryImage",
      label: "Secondary Image",
      type: "image",
      required: false,
    },
    {
      key: "indexImage",
      label: "Index Image",
      type: "image",
      required: false,
      description: "Image used in the project listing",
    },
    {
      key: "overview",
      label: "Overview",
      type: "textarea",
      required: true,
      description: "Detailed project overview",
    },
    {
      key: "why",
      label: "Why",
      type: "textarea",
      required: true,
      description: "Why this project exists",
    },
    {
      key: "techStack",
      label: "Tech Stack",
      type: "list",
      required: false,
      description: "Technologies used",
    },
    {
      key: "features",
      label: "Features",
      type: "list",
      required: false,
    },
    {
      key: "challenges",
      label: "Challenges",
      type: "list",
      required: false,
    },
    {
      key: "lessons",
      label: "Lessons",
      type: "list",
      required: false,
    },
    {
      key: "github",
      label: "GitHub URL",
      type: "url",
      required: false,
    },
    {
      key: "liveDemo",
      label: "Live Demo URL",
      type: "url",
      required: false,
    },
    {
      key: "platform",
      label: "Platform",
      type: "text",
      required: false,
      placeholder: "e.g. Web, iOS, Android",
    },
    {
      key: "framework",
      label: "Framework",
      type: "text",
      required: false,
      placeholder: "e.g. Next.js, Flutter",
    },
    {
      key: "started",
      label: "Started",
      type: "date",
      required: false,
    },
    {
      key: "repository",
      label: "Repository Visibility",
      type: "select",
      required: false,
      options: [
        { value: "public", label: "Public" },
        { value: "private", label: "Private" },
      ],
    },
    {
      key: "version",
      label: "Version",
      type: "text",
      required: true,
      placeholder: "e.g. 1.0.0",
    },
  ],
};

const PAGE_SCHEMA: ContentSchema = {
  contentType: "page",
  label: "Page",
  allowedBlockTypes: ["paragraph", "heading", "quote", "image"],
  requiredMetadataKeys: [],
  metadataFields: [
    {
      key: "description",
      label: "Description",
      type: "text",
      required: false,
      description: "Short page description for metadata",
    },
    {
      key: "navigationLabel",
      label: "Navigation Label",
      type: "text",
      required: false,
      description: "Custom label for navigation (defaults to title)",
    },
  ],
};
