import Container from "@/components/Container";
import ProjectTimeline from "@/components/ProjectTimeline";

import { getProjects } from "@/lib/projects";

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <Container>
      <main className="pb-20 pt-12 sm:pt-16">
        <header className="max-w-2xl pb-16 sm:pb-20">
          <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-5xl">
            Things I’m making,
            <br />
            slowly and on purpose.
          </h1>
        </header>

        <ProjectTimeline projects={projects} />
      </main>
    </Container>
  );
}