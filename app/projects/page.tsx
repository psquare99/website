import Container from "@/components/Container";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectCard from "@/components/ProjectCard";

import { getProjects } from "@/lib/projects";

export default function ProjectsPage() {
  const projects =
    getProjects();

  const featuredProject =
    projects.find(
      (project) =>
        project.slug ===
        "adi-kailash"
    );

  const otherProjects =
    projects.filter(
      (project) =>
        project.slug !==
        "adi-kailash"
    );

  return (
    <Container>
      <main className="py-12">

        {featuredProject && (
          <section>
            <FeaturedProject
              project={
                featuredProject
              }
            />
          </section>
        )}

        <section>
          {otherProjects.map(
            (project, index) => (
              <ProjectCard
  key={project.slug}
  project={project}
  index={index}
/>
            )
          )}
        </section>

      </main>
    </Container>
  );
}