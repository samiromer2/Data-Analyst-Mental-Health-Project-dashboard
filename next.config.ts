import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingIncludes: {
    "/api/**": ["./data/processed/**"],
    "/dashboard/**": ["./data/processed/**"],
    "/executive-brief/**": ["./data/processed/**"],
  },
  async redirects() {
    return [
      {
        source: "/insights",
        destination: "/executive-brief#actionable-insights",
        permanent: true,
      },
      {
        source: "/explorer",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
