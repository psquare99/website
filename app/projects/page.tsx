import type { Metadata } from "next";

import Container from "@/components/Container";
import ProjectTimeline from "@/components/ProjectTimeline";

import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Things I'm making, slowly and on purpose — apps, websites, games, and experiments.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects • The Long Way Home",
    description:
      "Things I'm making, slowly and on purpose — apps, websites, games, and experiments.",
    url: "https://thelongwayhome.dev/projects",
    siteName: "The Long Way Home",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Long Way Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects • The Long Way Home",
    description:
      "Things I'm making, slowly and on purpose.",
    images: ["/opengraph-image"],
  },
};

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