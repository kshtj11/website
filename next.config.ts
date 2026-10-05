import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages: `next build` writes plain HTML/CSS/JS to `out/`.
 * No server at runtime, so no API routes, middleware, or on-request data fetching.
 */
const nextConfig: NextConfig = {
  output: "export",
  // /work/mecha/ -> out/work/mecha/index.html, which GitHub Pages serves directly.
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
