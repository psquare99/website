import type { Project } from "@/types/project";

import {
  Smartphone,
  Wrench,
  CalendarDays,
  CircleDot,
  Lock,
  User,
} from "lucide-react";

interface ProjectFactsProps {
  project: Project;
}

export default function ProjectFacts({
  project,
}: ProjectFactsProps) {
  const facts = [
    {
      icon: Smartphone,
      label: "Platform",
      value: project.platform,
    },
    {
      icon: Wrench,
      label: "Framework",
      value: project.techStack[0],
    },
    {
      icon: CalendarDays,
      label: "Started",
      value: project.started,
    },
    {
      icon: CircleDot,
      label: "Status",
      value:
        project.status.charAt(0).toUpperCase() +
        project.status.slice(1),
    },
    {
      icon: Lock,
      label: "Repository",
      value: project.repository,
    },
    {
      icon: User,
      label: "Team",
      value: "Solo",
    },
  ];

  return (
    <div className="space-y-8">

      <h3 className="text-2xl font-semibold">
        At a Glance
      </h3>

      <div className="mt-6 grid grid-cols-2 gap-4">

        {facts.map((fact) => {
          const Icon = fact.icon;

          return (
            <div
              key={fact.label}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-sm"
            >
              <Icon
  size={20}
  style={{
    color: project.accentColor,
  }}
/>

<p className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
                {fact.label}
              </p>

              <p className="mt-0.5 text-base font-semibold">
                {fact.value}
              </p>
            </div>
          );
        })}

      </div>

    </div>
  );
}