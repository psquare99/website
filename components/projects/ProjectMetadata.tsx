import type { Project } from "@/types/project";

import ProjectStatusBadge from "./ProjectStatusBadge";

interface ProjectMetadataProps {
  project: Project;
}

export default function ProjectMetadata({
  project,
}: ProjectMetadataProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight">
        At a Glance
      </h3>

      <div className="mt-8 space-y-5">

        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <span className="text-neutral-500">
            Status
          </span>

          <ProjectStatusBadge
            status={project.status}
          />
        </div>

        <MetadataRow
          label="Platform"
          value={project.platform}
        />

        <MetadataRow
          label="Framework"
          value={project.framework}
        />

        <MetadataRow
          label="Started"
          value={project.started}
        />

        <MetadataRow
          label="Repository"
          value={
            project.repository === "public"
              ? "Public"
              : "Private"
          }
        />

      </div>
    </div>
  );
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-4">

      <span className="text-neutral-500">
        {label}
      </span>

      <span className="font-medium text-neutral-900">
        {value}
      </span>

    </div>
  );
}