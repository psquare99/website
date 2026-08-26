import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAboutPage } from "@/lib/repository/about";
import type { AboutData } from "@/types/about";
import AboutEditor from "@/components/admin/about/AboutEditor";

function emptyAboutData(): AboutData {
  return {
    intro: { eyebrow: "", heading: "", text: "", signature: "", image: "", imageAlt: "" },
    making: { heading: "", text: "", image: "", imageAlt: "", linkLabel: "", linkUrl: "" },
    mountains: { heading: "", text: "", location: "", image: "", imageAlt: "" },
    reading: { heading: "", text: "", bookTitle: "", bookAuthor: "", bookCover: "", bookCoverAlt: "" },
    now: [],
    closing: { eyebrow: "", heading: "", text: "", signature: "" },
  };
}

export default async function AdminAboutPage() {
  const { env } = getCloudflareContext();
  const content = await getAboutPage((env as CloudflareEnv).CONTENT_DB);

  return <AboutEditor initial={content ?? emptyAboutData()} />;
}
