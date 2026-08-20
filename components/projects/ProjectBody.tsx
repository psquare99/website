import type { Project } from "@/types/project";

import ProjectContent from "./ProjectContent";

import ProjectResources from "./ProjectResources";
import ProjectSection from "./ProjectSection";
import ProjectSidebar from "./ProjectSidebar";
import ProjectWhy from "./ProjectWhy";

interface ProjectBodyProps {
  project: Project;
}

export default function ProjectBody({
  project,
}: ProjectBodyProps) {
  return (
    <div className="grid items-start gap-16 lg:grid-cols-[3fr_2fr]">
      {/* LEFT COLUMN */}
      <article className="space-y-14">
        {project.blocks.length > 0 ? (
          <ProjectContent blocks={project.blocks} />
        ) : (
          <>
        <ProjectSection
          title="Overview"
          accentColor={project.accentColor}
        >
          <div className="max-w-xl">
            <p>{project.overview}</p>
          </div>
        </ProjectSection>
        <ProjectWhy project={project} />

        <ProjectSection
          title="Features"
          accentColor={project.accentColor}
        >
          <ul className="space-y-4 list-disc pl-5 marker:text-neutral-400">
            {project.features.map((feature) => (
              <li
                key={feature}
                className="leading-8 marker:text-neutral-400"
              >
                {feature}
              </li>
            ))}
          </ul>
        </ProjectSection>

        {project.challenges && (
          <ProjectSection
            title="Challenges"
            accentColor={project.accentColor}
          >
            <ul className="space-y-4 list-disc pl-5 marker:text-neutral-400">
              {project.challenges.map((challenge) => (
                <li
                  key={challenge}
                  className="leading-8 marker:text-neutral-400"
                >
                  {challenge}
                </li>
              ))}
            </ul>
          </ProjectSection>
        )}

        <ProjectSection
          title="Lessons Learned"
          accentColor={project.accentColor}
        >
          <ul className="space-y-4 list-disc pl-5 marker:text-neutral-400">
            {project.lessons.map((lesson) => (
              <li
                key={lesson}
                className="leading-8 marker:text-neutral-400"
              >
                {lesson}
              </li>
            ))}
          </ul>
        </ProjectSection>

        <ProjectResources project={project} />
          </>
        )}
      </article>

      {/* RIGHT COLUMN */}
      <ProjectSidebar project={project} />
    </div>
  );
}