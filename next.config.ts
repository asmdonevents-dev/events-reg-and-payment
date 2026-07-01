import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "html.tailus.io",
      }
    ],
  }
};
export default nextConfig;
