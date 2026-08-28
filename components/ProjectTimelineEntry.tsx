import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/types/project";
import { getOptimizedImageUrl } from "@/lib/media/url";

interface ProjectTimelineEntryProps {
  project: Project;
}

function getStatusLabel(project: Project) {
  if (project.status === "completed") return "Completed";
  if (project.status === "archived") return "Archived";
  return "Building";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function ProjectTimelineEntry({
  project,
}: ProjectTimelineEntryProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block rounded-2xl py-4 pl-8 transition-colors duration-300 hover:bg-neutral-50 sm:pl-12"
    >
      {/* Timeline marker */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-6 h-2.5 w-2.5 rounded-full ring-4 ring-white transition-transform duration-300 group-hover:scale-125 sm:left-[1px]"
        style={{ backgroundColor: project.accentColor }}
      />

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] lg:items-start lg:gap-12">
        {/* Project information */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
            {formatDate(project.publishedAt)}
          </p>

          <h2
            className="mt-3 text-3xl font-semibold tracking-tight transition-opacity duration-300 group-hover:opacity-80 sm:text-4xl"
            style={{ color: project.accentColor }}
          >
            {project.title}
          </h2>

          <p className="mt-2 text-lg text-neutral-600">
            {project.tagline}
          </p>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
            {project.summary}
          </p>

          <div className="mt-5 flex items-center gap-3 text-sm text-neutral-400">
            <span>{project.Category}</span>
            <span aria-hidden="true">·</span>
            <span>{getStatusLabel(project)}</span>
          </div>
        </div>

        {/* Project image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100">
          <Image
            unoptimized
            src={getOptimizedImageUrl(project.indexImage ?? project.primaryImage, { width: 900 })}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      </div>
    </Link>
  );
}