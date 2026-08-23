import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

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