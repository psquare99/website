interface ProjectTechStackProps {
  techStack: string[];
}

export default function ProjectTechStack({
  techStack,
}: ProjectTechStackProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {techStack.map((tech) => (
        <span
          key={tech}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}