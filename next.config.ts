import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "thevoiceofblackcincinnati.com" },
    ],
  },

  webpack: (config) => {
    // Ensure filesystem cache uses an absolute path
    if (config.cache && config.cache.type === "filesystem") {
      config.cache.cacheDirectory = path.resolve(
        process.cwd(),
        ".next/cache/webpack"
      );
    }

    return config;
  },
};

export default nextConfig;
