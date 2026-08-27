import type { Metadata } from "next";

import Container from "@/components/Container";
import { getAboutContent } from "@/lib/publishing/about-content";

import FieldJournalProto from "@/components/about/prototypes/FieldJournalProto";
import BaseCampProto from "@/components/about/prototypes/BaseCampProto";
import WayfinderProto from "@/components/about/prototypes/WayfinderProto";
import TravellersLogProto from "@/components/about/prototypes/TravellersLogProto";
import WorkshopWallProto from "@/components/about/prototypes/WorkshopWallProto";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — Prototypes",
  description: "Visual direction prototypes for the About page.",
  robots: { index: false, follow: false },
};

const PROTOTYPES: { id: string; name: string; note: string }[] = [
  { id: "A", name: "Field Journal", note: "A literary personal notebook." },
  { id: "B", name: "Base Camp", note: "A quiet mountain cabin / workspace." },
  { id: "C", name: "Wayfinder / Compass", note: "A personal compass." },
  { id: "D", name: "Traveller's Log", note: "A record of an ongoing journey." },
  { id: "E", name: "Workshop Wall", note: "Objects placed on a workshop wall." },
];

function PrototypeFrame({
  id,
  name,
  note,
  children,
  index,
}: {
  id: string;
  name: string;
  note: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <section
      aria-label={`Prototype ${id} — ${name}`}
      className="border-t border-[var(--color-border)]"
    >
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-baseline gap-4">
          <span className="font-sans text-xs font-bold tracking-widest text-[var(--color-accent)]">
            {id}
          </span>
          <span className="font-serif text-lg text-neutral-900">{name}</span>
          <span className="hidden font-sans text-xs text-[var(--muted)] sm:inline">{note}</span>
          <span className="ml-auto font-mono text-xs text-[var(--muted)]">
            {index + 1}/{PROTOTYPES.length}
          </span>
        </div>
      </header>
      <div className="relative">{children}</div>
    </section>
  );
}

export default async function AboutPrototypesPage() {
  const about = await getAboutContent();

  if (!about) {
    return (
      <Container>
        <p className="py-20 text-center italic text-neutral-400">No about content yet.</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
          About — visual directions
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
          Five prototypes, one feeling
        </h1>
        <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-6 text-[var(--muted)]">
          Visual experiments only — no database or admin changes. Scroll to compare the five
          compositions using the live About content.
        </p>
      </div>

      <PrototypeFrame id="A" name="Field Journal" note="A literary personal notebook." index={0}>
        <FieldJournalProto about={about} />
      </PrototypeFrame>

      <PrototypeFrame id="B" name="Base Camp" note="A quiet mountain cabin / workspace." index={1}>
        <BaseCampProto about={about} />
      </PrototypeFrame>

      <PrototypeFrame id="C" name="Wayfinder / Compass" note="A personal compass." index={2}>
        <WayfinderProto about={about} />
      </PrototypeFrame>

      <PrototypeFrame id="D" name="Traveller's Log" note="A record of an ongoing journey." index={3}>
        <TravellersLogProto about={about} />
      </PrototypeFrame>

      <PrototypeFrame id="E" name="Workshop Wall" note="Objects placed on a workshop wall." index={4}>
        <WorkshopWallProto about={about} />
      </PrototypeFrame>

      <p className="py-12 text-center font-sans text-xs text-[var(--muted)]">
        These are visual directions only and are not the production About page.
      </p>
    </Container>
  );
}
