import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ccagi",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
