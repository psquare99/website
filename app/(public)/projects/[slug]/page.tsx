import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/components/Container";

import { getPublishedProject } from "@/lib/publishing/published-projects";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return {};

  return {
    title: `${project.title} • The Long Way Home`,
    description: project.tagline,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.tagline,
      url: `https://thelongwayhome.dev/projects/${project.slug}`,
      siteName: "The Long Way Home",
      locale: "en_US",
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();

  return (
    <Container>
      <main className="mx-auto max-w-3xl py-20">
        <header className="mb-12">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {project.Category}
          </p>
          <h1 className="text-4xl font-normal tracking-tight text-neutral-900 sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            {project.tagline}
          </p>
        </header>
        <article className="prose prose-neutral max-w-none text-lg leading-9 text-neutral-700">
          {project.overview && <p>{project.overview}</p>}
          {project.blocks.map((block) => {
            switch (block.type) {
              case "paragraph":
                return (
                  <p key={block.id}>
                    {(block.data as { text?: string }).text ?? ""}
                  </p>
                );
              case "heading":
                return (
                  <h2
                    key={block.id}
                    className="text-3xl font-semibold tracking-tight text-[#2C2A28]"
                  >
                    {(block.data as { text?: string }).text ?? ""}
                  </h2>
                );
              case "quote":
                return (
                  <blockquote
                    key={block.id}
                    className="border-l-2 border-neutral-300 pl-4 italic text-neutral-600"
                  >
                    {(block.data as { text?: string }).text ?? ""}
                  </blockquote>
                );
              case "image":
                return (
                  <figure key={block.id} className="my-8">
                    <img
                      src={(block.data as { src?: string }).src ?? ""}
                      alt={(block.data as { alt?: string }).alt ?? ""}
                      loading="lazy"
                      decoding="async"
                      className="rounded-lg"
                    />
                  </figure>
                );
              default:
                return null;
            }
          })}
        </article>
      </main>
    </Container>
  );
}
