import Image from "next/image";

import type { Project } from "@/types/project";

import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectTechStack from "./ProjectTechStack";

interface ProjectHeaderProps {
  project: Project;
}

export default function ProjectHeader({
  project,
}: ProjectHeaderProps) {
  return (
    <header className="mx-auto mb-12 max-w-4xl">

  <div className="flex items-center justify-center gap-5">

    <Image
      src={project.logo}
      alt={project.title}
      width={72}
      height={72}
      className="rounded-2xl shadow-sm"
    />

    <div>
      <h1 className="text-6xl font-bold leading-none tracking-tight text-neutral-900">
        {project.title}
      </h1>

      <p className="mt-1 text-2xl font-light text-neutral-600">
        {project.tagline}
      </p>
    </div>

  </div>

  <div className="mt-10 flex flex-wrap justify-center gap-3">
    <ProjectStatusBadge status={project.status} />
    <ProjectTechStack techStack={project.techStack} />
  </div>

</header>
  );
}