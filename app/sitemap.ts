import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://thelongwayhome.dev",
      lastModified: new Date(),
    },
    {
      url: "https://thelongwayhome.dev/journal",
      lastModified: new Date(),
    },
    {
      url: "https://thelongwayhome.dev/projects",
      lastModified: new Date(),
    },
    {
      url: "https://thelongwayhome.dev/about",
      lastModified: new Date(),
    },
  ];
}