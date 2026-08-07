import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/types/project";

import ProjectStatusBadge from "./projects/ProjectStatusBadge";
import ProjectTechStack from "./projects/ProjectTechStack";

interface FeaturedProjectProps {
  project: Project;
}

export default function FeaturedProject({
  project,
}: FeaturedProjectProps) {
  return (
    <section
  className="rounded-[40px] border border-neutral-200 px-10 py-8 shadow-sm"
  style={{
    background:
      "linear-gradient(to bottom, white, #f8fbff)",
  }}
>

      <p className="mb-4 text-sm font-medium tracking-[0.15em] text-neutral-500">
  ✨ This is where most of my time is going right now...
</p>

      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">

        {/* Left */}

        <div>

          <Image
            src={project.logo}
            alt={project.title}
            width={88}
            height={88}
            className="rounded-2xl"
          />

          <h2 className="mt-6 text-5xl font-bold tracking-tight">
            {project.title}
          </h2>

          <p className="mt-3 text-2xl font-light text-neutral-600">
            {project.tagline}
          </p>
<p className="mt-4 text-sm font-medium text-emerald-600">
  Currently under active development
</p>
          <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-600">
            {project.overview}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ProjectStatusBadge status={project.status} />
            <ProjectTechStack techStack={project.techStack} />
          </div>

          <Link
            href={`/projects/${project.slug}`}
            className="group mt-10 inline-flex items-center gap-2 text-lg font-semibold transition-all"
          >
           <>
  Explore Project

  <span className="transition-transform duration-300 group-hover:translate-x-1">
    →
  </span>
</>
          </Link>

        </div>

        {/* Right */}

<div className="flex items-center justify-center">

  <Image
    src={project.primaryImage}
    alt={project.title}
    width={300}
    height={600}
    className="rounded-[28px] shadow-xl"
  />

</div>

      </div>

    </section>
  );
}