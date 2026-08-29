import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingIncludes: {
    "/api/**": ["./data/processed/**"],
    "/dashboard/**": ["./data/processed/**"],
    "/explorer/**": ["./data/processed/**"],
    "/insights/**": ["./data/processed/**"],
  },
};

export default nextConfig;
