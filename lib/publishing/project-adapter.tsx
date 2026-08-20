import type { Project, ProjectBlock } from "@/types/project";

export interface PublishedProjectDocument {
  contractVersion: "0.1";

  id: string;

  contentType: "project";

  slug: string;

  publishedAt: string;

  metadata: Record<string, unknown>;

  blocks: ProjectBlock[];
}

function getString(
  metadata: Record<string, unknown>,
  key: string
): string | undefined {
  const value = metadata[key];

  return typeof value === "string"
    ? value.trim()
    : undefined;
}

function getStringArray(
  metadata: Record<string, unknown>,
  key: string
): string[] {
  const value = metadata[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string"
  );
}

function normalizeImageUrl(
  value: string | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `/${value}`;
}
export function projectFromPublishedDocument(
  document: PublishedProjectDocument
): Project {
  if (
    document.contentType !== "project"
  ) {
    throw new Error(
      `Cannot adapt "${document.contentType}" as a project.`
    );
  }

  const metadata =
    document.metadata;

  const title =
    getString(
      metadata,
      "title"
    );

  const tagline =
    getString(
      metadata,
      "tagline"
    );

  const summary =
    getString(
      metadata,
      "summary"
    );

  const category =
    getString(
      metadata,
      "category"
    );

  const status =
    getString(
      metadata,
      "status"
    );

  const accentColor =
    getString(
      metadata,
      "accentColor"
    );

  const logo =
  normalizeImageUrl(
    getString(metadata, "logo")
  );

const primaryImage =
  normalizeImageUrl(
    getString(metadata, "primaryImage")
  );

const secondaryImage =
  normalizeImageUrl(
    getString(metadata, "secondaryImage")
  );

  const overview =
    getString(
      metadata,
      "overview"
    );

  const why =
    getString(
      metadata,
      "why"
    );

  const version =
    getString(
      metadata,
      "version"
    );

  if (
    !title ||
    !tagline ||
    !summary ||
    !category ||
    !status ||
    !accentColor ||
    !logo ||
    !primaryImage ||
    !secondaryImage ||
    !overview ||
    !why ||
    !version
  ) {
    throw new Error(
      `Published project "${document.slug}" is missing required fields.`
    );
  }

  return {
    slug: document.slug,

    title,

    tagline,

    summary,

    logo,

    primaryImage,

    secondaryImage,

    Category:
      category as Project["Category"],

    status:
      status as Project["status"],

    overview,

    why,

    techStack:
      getStringArray(
        metadata,
        "techStack"
      ),

    features:
      getStringArray(
        metadata,
        "features"
      ),

    challenges:
      getStringArray(
        metadata,
        "challenges"
      ),

    lessons:
      getStringArray(
        metadata,
        "lessons"
      ),

    github:
      getString(
        metadata,
        "github"
      ),

    gallery:
      getString(
        metadata,
        "gallery"
      ),

    liveDemo:
      getString(
        metadata,
        "liveDemo"
      ),

    platform:
      getString(
        metadata,
        "platform"
      ),

    framework:
      getString(
        metadata,
        "framework"
      ),

    started:
      getString(
        metadata,
        "started"
      ),

    repository:
      getString(
        metadata,
        "repository"
      ) as Project["repository"],

    accentColor,

    roadmap:
      getStringArray(
        metadata,
        "roadmap"
      ),

    version,

    blocks:
      Array.isArray(document.blocks)
        ? document.blocks
        : [],
  };
}