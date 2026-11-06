import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "reslhgfggvmataetmnvp.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/productos/sudadera-norte",
        destination: "/productos/buzo-norte",
        permanent: true,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: "6mb",
      ...(process.env.NODE_ENV === "development"
        ? { allowedOrigins: ["*.trycloudflare.com"] }
        : {}),
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
