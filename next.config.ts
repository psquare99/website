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

const nextConfig: NextConfig = {
  images: mediaUrl
    ? {
        remotePatterns: [
          {
            protocol:
              mediaProtocol,
            hostname:
              mediaUrl.hostname,
            port:
              mediaUrl.port,
            pathname:
              "/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;

initOpenNextCloudflareForDev();