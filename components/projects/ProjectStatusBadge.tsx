import type { ProjectStatus } from "@/types/project";
import { Circle } from "lucide-react";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const statusStyles = {
  building:
    "border-yellow-300 bg-yellow-50 text-yellow-800",

  completed:
    "border-green-300 bg-green-50 text-green-800",

  archived:
    "border-red-300 bg-red-50 text-red-800",
};

const statusLabel = {
  building: "Building",
  completed: "Completed",
  archived: "Archived",
};

export default function ProjectStatusBadge({
  status,
}: ProjectStatusBadgeProps) {
  return (
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${statusStyles[status]}`}
  >
    <Circle
      size={10}
      fill="#FACC15"
className="text-yellow-400 animate-pulse"
    />

    {statusLabel[status]}
  </span>
);
}