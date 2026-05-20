import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root so the inferred-root warning goes away.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
