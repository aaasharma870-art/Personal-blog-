import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats and allow the low quality used for ambient backdrops
    // (large generative stills) so they ship small.
    formats: ["image/avif", "image/webp"],
    qualities: [55, 75],
  },
};

export default nextConfig;
