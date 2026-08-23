import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const mediaPublicUrl =
  process.env.MEDIA_PUBLIC_URL;

const mediaUrl =
  mediaPublicUrl
    ? new URL(mediaPublicUrl)
    : undefined;

const mediaProtocol =
  mediaUrl?.protocol === "http:"
    ? "http"
    : "https";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-afd5b578ae094d339252bb77b1349f57.r2.dev",
      },
    ],
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();