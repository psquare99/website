import { notFound } from "next/navigation";

import type { Metadata } from "next";

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

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;

  const project = getProject(slug);

  if (!project) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `/projects/${slug}`,
    },
    openGraph: {
      title: `${project.title} • Projects`,
      description: project.summary,
      url: `https://thelongwayhome.dev/projects/${slug}`,
      siteName: "The Long Way Home",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: project.primaryImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} • Projects`,
      description: project.summary,
      images: [project.primaryImage],
    },
  };
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