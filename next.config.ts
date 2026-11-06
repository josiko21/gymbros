import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is a package-lock.json in the home folder. Without this, Turbopack
  // treats that as the project root and ignores saves inside this repo.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
