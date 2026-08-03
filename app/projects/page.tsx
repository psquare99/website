import Container from "@/components/Container";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectCard from "@/components/ProjectCard";

import { projects } from "@/content/projects";

export default function ProjectsPage() {
  const featuredProject = projects[0];
  const otherProjects = projects.slice(1);

  return (
    <Container>
      <main className="py-12">

        {/* Hero */}

        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900">
            Projects
          </h1>

          <p className="mt-6 text-xl leading-9 text-neutral-600">
            Every project begins with a real problem, a curiosity,
            or a story worth telling.
          </p>
        </section>

        {/* Featured Project */}

        <section className="mt-20">
          <FeaturedProject project={featuredProject} />
        </section>

        {/* Other Projects */}

        <section className="mt-16">

          <div className="mb-12 text-center">

            <h2 className="text-3xl font-bold tracking-tight">
              More Projects
            </h2>

            <p className="mt-3 text-neutral-600">
              Experiments, ideas and products I'm currently building.
            </p>

          </div>

          {otherProjects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
            />
          ))}

        </section>

      </main>
    </Container>
  );
}