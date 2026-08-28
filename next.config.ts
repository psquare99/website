import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-cf03fb0406654b30a8f4535e5e423f54.r2.dev",
      },
      {
        protocol: "https",
        hostname: "media.thelongwayhome.dev",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/studio",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();