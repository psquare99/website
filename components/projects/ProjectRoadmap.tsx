import { Sparkles, Check } from "lucide-react";

import type { Project } from "@/types/project";

interface ProjectRoadmapProps {
  project: Project;
}

export default function ProjectRoadmap({
  project,
}: ProjectRoadmapProps) {
  return (
    <section className="mt-8">
      <h3 className="flex items-center gap-2 text-xl font-semibold">
        <Sparkles
          size={20}
          style={{
            color: project.accentColor,
          }}
        />

        Currently Exploring
      </h3>

      <div className="mt-5 space-y-4">
  {project.roadmap.map((item) => (
    <div
      key={item}
      className="flex items-center gap-3"
    >
      <Check
        size={16}
        style={{
          color: project.accentColor,
        }}
      />

      <span className="text-neutral-700">
        {item}
      </span>
    </div>
  ))}
</div>
<div className="mt-8 border-t border-neutral-200 pt-5">
  <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
    Version
  </p>

  <p className="mt-2 text-lg font-semibold text-neutral-900">
    {project.version}
  </p>

  <p className="mt-1 text-sm text-neutral-500">
    Actively developed
  </p>
</div>
    </section>
  );
}