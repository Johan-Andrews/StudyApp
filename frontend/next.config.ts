import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow the backend EC2 URL as an image source if needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
