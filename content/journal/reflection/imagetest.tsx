import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      this is a image test
    </p>

    <Image
      src="/images/journal/reflection/image-test/frontier-valley.jpg"
      alt=""
      width={4592}
      height={8160}
      className="my-10 rounded-2xl"
    />
  </>
);

export const imagetest: JournalEntry = {
  slug: "image-test",

  title: "Image Test",

  excerpt: "",

  published: "2026-08-08",

  category: "reflection",

  paper: "cream",

  readingTime: "1 min",

  content,

  status: "draft",
};
