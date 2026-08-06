import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({
  project,
  index,
}: ProjectCardProps) {
  const imageLeft = index % 2 === 1;

  return (
    <article className="border-b border-neutral-200 py-10">
      <div className="grid items-center gap-10 lg:grid-cols-2">

        {imageLeft && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-neutral-100">
            <Image
              src={project.primaryImage}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div>
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900">
            {project.title}
          </h2>

          <p className="mt-4 text-xl text-neutral-600">
            {project.tagline}
          </p>

          <p className="mt-8 max-w-lg leading-8 text-neutral-700">
            {project.summary}
          </p>

          <Link
            href={`/projects/${project.slug}`}
            className="mt-8 inline-flex items-center gap-2 font-semibold transition-all duration-200 hover:gap-3"
          >
            Explore →
          </Link>
        </div>

        {!imageLeft && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-neutral-100">
            <Image
              src={project.primaryImage}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        )}

      </div>
    </article>
  );
}