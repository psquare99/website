import ProjectSection from "./ProjectSection";
import type { Project } from "@/types/project";
import { ArrowUpRight } from "lucide-react";
interface ProjectResourcesProps {
  project: Project;
}

export default function ProjectResources({
  project,
}: ProjectResourcesProps) {
  return (
    <ProjectSection
  title="Resources"
  accentColor={project.accentColor}
>
      <div className="space-y-3">

        {project.github && (
          <a
  href={project.github}
  target="_blank"
  rel="noopener noreferrer"
  className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-7 py-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-transparent"
>
  <span>Source Code</span>

  <span><ArrowUpRight
  size={18}
  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
/></span>
</a>
        )}

        {project.gallery && (
          <a
  href={project.gallery}
  target="_blank"
  rel="noopener noreferrer"
  className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-7 py-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-transparent"
>
  <span>View Gallery</span>


  <span><ArrowUpRight
  size={18}
  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
/></span>
</a>
        )}

        {project.liveDemo && (
          <a
  href={project.liveDemo}
  target="_blank"
  rel="noopener noreferrer"
  className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md hover:border-transparent"
>
  <span>Live Demo</span>

  <span><ArrowUpRight
  size={18}
  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
/></span>
</a>
        )}

      </div>
    </ProjectSection>
  );
}