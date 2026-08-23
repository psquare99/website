import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/types/project";
import {
  getProjectSurfaceColor,
  getProjectBorderColor,
} from "@/lib/project-colors";

interface ProjectCardProps {
  project: Project;
}

function getStatusLabel(project: Project) {
  if (project.status === "completed") {
    return "Completed";
  }

  if (project.status === "archived") {
    return "Archived";
  }

  return "In development";
}

function getStatusClasses(project: Project) {
  if (project.status === "completed") {
    return "bg-white/70 text-emerald-800";
  }

  if (project.status === "archived") {
    return "bg-white/70 text-neutral-700";
  }

  return "bg-white/70 text-neutral-700";
}

export default function ProjectCard({
  project,
}: ProjectCardProps) {
  const statusLabel = getStatusLabel(project);
  const surfaceColor = getProjectSurfaceColor(project.accentColor);
  const borderColor = getProjectBorderColor(project.accentColor);
  return (
    <article
  className="group flex min-h-[260px] flex-col justify-between rounded-[28px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
  style={{
    backgroundColor: surfaceColor,
    borderColor,
  }}
>
      <div className="flex gap-5">
        {/* Project icon */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/60">
          <Image
            src={project.logo}
            alt={project.title}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Project information */}
        <div className="min-w-0 pt-1">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
              project
            )}`}
          >
            {statusLabel}
          </span>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
            {project.title}
          </h2>

          <p className="mt-3 line-clamp-3 leading-7 text-neutral-700/80">
            {project.summary}
          </p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/projects/${project.slug}`}
        className="group/link mt-7 inline-flex w-fit items-center gap-2 font-semibold text-neutral-800 transition-colors hover:text-neutral-950"
      >
        {project.status === "completed"
          ? "View project"
          : "Explore"}

        <span className="transition-transform duration-200 group-hover/link:translate-x-1">
          →
        </span>
      </Link>
    </article>
  );
}