import Container from "@/components/Container";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectCard from "@/components/ProjectCard";

import { projects } from "@/content/projects";

export default function ProjectsPage() {
  const featuredProject = projects.find(
  (project) => project.slug === "adi-kailash",
)!;

const otherProjects = projects.filter(
  (project) => project.slug !== "adi-kailash",
);

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