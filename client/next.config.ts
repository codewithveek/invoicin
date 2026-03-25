import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // force-dynamic is set in src/app/layout.tsx (auth-aware routes)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.API_URL ?? "http://localhost:3300"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
