import type { Metadata } from "next";

import AboutPinboard from "@/components/about/prototypes/AboutPinboard";
import { getAboutContent } from "@/lib/publishing/about-content";
import "@/app/about-pinboard.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — Pinboard prototype",
  description: "Phase 14 — the About page as a stack of physical boards.",
  robots: { index: false, follow: false },
};

export default async function PinboardPrototypePage() {
  const about = await getAboutContent();

  if (!about) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="italic text-neutral-400">No about content yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AboutPinboard about={about} />
    </div>
  );
}
