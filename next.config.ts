import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — there's an unrelated lockfile one level up.
  turbopack: { root: import.meta.dirname },

  // Type-check every <Link href> and router push against the real route tree.
  typedRoutes: true,

  // Tree-shake icon imports (avoids pulling the whole lucide-react barrel).
  experimental: { optimizePackageImports: ["lucide-react"] },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // The service worker must never be cached, so shell updates ship fast.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
