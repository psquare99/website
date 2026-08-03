import type { Project } from "@/types/project";

import ProjectImage from "./ProjectImage";
import ProjectFacts from "./ProjectFacts";
import ProjectRoadmap from "./ProjectRoadmap";

interface ProjectSidebarProps {
  project: Project;
}

export default function ProjectSidebar({
  project,
}: ProjectSidebarProps) {
  return (
    <aside className="sticky top-24">

      <div
  className="rounded-3xl border border-neutral-200 shadow-sm"
  style={{
    background: "linear-gradient(to bottom, white, #f8fbff)",
  }}
>

        {/* Screenshot */}

        <div className="p-6">

          <ProjectImage
            src={project.primaryImage}
            alt={`${project.title} screenshot`}
          />

        </div>

        {/* Divider */}

        <div className="border-t border-neutral-100" />

        {/* Facts */}

        {/* Facts + Roadmap */}

<div className="p-6">

  <ProjectFacts project={project} />

  <ProjectRoadmap project={project} />

</div>

      </div>

    </aside>
  );
}