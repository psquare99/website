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

        {/* Featured Project */}

        <section>
          <FeaturedProject project={featuredProject} />
        </section>

        {/* Other Projects */}

        <section className="mt-12">
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