import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "cmdk"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
