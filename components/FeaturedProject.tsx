import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/types/project";

interface FeaturedProjectProps {
  project: Project;
}

export default function FeaturedProject({
  project,
}: FeaturedProjectProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        {/* Content */}
        <div className="flex h-full flex-col">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              Building
            </span>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
              {project.title}
            </h2>

            <p className="mt-2 text-lg text-neutral-600 sm:text-xl">
              {project.tagline}
            </p>

            <div className="mt-7 h-px w-10 bg-neutral-200" />

            <p className="mt-7 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              {project.overview}
            </p>
          </div>

          <Link
            href={`/projects/${project.slug}`}
            className="group mt-8 inline-flex w-fit items-center gap-2 font-semibold text-blue-700 transition-colors hover:text-blue-900"
          >
            Explore project
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Image */}
        <div className="relative overflow-hidden rounded-[22px] bg-neutral-100">
          <div className="aspect-[16/10]">
            <Image
              src={project.primaryImage}
              alt={project.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </article>
  );
}