import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["@app"],
};

export default nextConfig;
