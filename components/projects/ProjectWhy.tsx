import type { Project } from "@/types/project";

interface ProjectWhyProps {
  project: Project;
}

export default function ProjectWhy({
  project,
}: ProjectWhyProps) {
  return (
    <section className="max-w-2xl">
      <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
        Why I Built This
      </h2>

      <div
        className="mt-4 h-1.5 w-20 rounded-full"
        style={{
          background: project.accentColor,
        }}
      />

      <blockquote className="mt-8 border-l-4 border-neutral-200 pl-6">
        <p className="text-xl leading-9 text-neutral-700 italic">
          "{project.why}"
        </p>
      </blockquote>
    </section>
  );
}