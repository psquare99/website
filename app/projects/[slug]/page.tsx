import { notFound } from "next/navigation";

import Container from "@/components/Container";
import ProjectBody from "@/components/projects/ProjectBody";
import ProjectHeader from "@/components/projects/ProjectHeader";

import {
  getProject,
} from "@/lib/projects";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } =
    await params;

  const project =
    getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <Container>
      <div className="pt-8 pb-16">
        <ProjectHeader
          project={project}
        />

        <ProjectBody
          project={project}
        />
      </div>
    </Container>
  );
}