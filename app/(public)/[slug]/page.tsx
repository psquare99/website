import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/components/Container";

import { getPublishedPage } from "@/lib/publishing/published-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return {};

  return {
    title: `${page.title} • The Long Way Home`,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://thelongwayhome.dev/${page.slug}`,
      siteName: "The Long Way Home",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <Container>
      <main className="mx-auto max-w-3xl py-20">
        <header className="mb-12">
          <h1 className="text-4xl font-normal tracking-tight text-neutral-900 sm:text-5xl">
            {page.title}
          </h1>
        </header>
        <article className="prose prose-neutral max-w-none text-lg leading-9 text-neutral-700">
          {page.content}
        </article>
      </main>
    </Container>
  );
}
