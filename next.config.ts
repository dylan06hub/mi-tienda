import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImagePattern = supabaseUrl
  ? new URL("/storage/v1/object/public/productos/**", supabaseUrl)
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePattern ? [supabaseImagePattern] : [],
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
