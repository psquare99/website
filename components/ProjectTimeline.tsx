import type { Project } from "@/types/project";
import ProjectTimelineEntry from "@/components/ProjectTimelineEntry";

interface ProjectTimelineProps {
  projects: Project[];
}

export default function ProjectTimeline({
  projects,
}: ProjectTimelineProps) {
  const visibleProjects = projects
    .filter((project) => project.slug !== "studio-test-project")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    );

  return (
    <section aria-label="Project timeline" className="relative">
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[4px] top-2 w-px bg-neutral-200 sm:left-[6px]"
      />

      <div className="space-y-12 sm:space-y-16">
        {visibleProjects.map((project) => (
          <ProjectTimelineEntry
            key={project.slug}
            project={project}
          />
        ))}
      </div>
    </section>
  );
}