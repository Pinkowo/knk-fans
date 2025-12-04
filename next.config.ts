import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { getEnv } from "./src/lib/env";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GA_ID: getEnv("NEXT_PUBLIC_GA_ID", { optional: true }),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)\\.(js|css|png|jpg|jpeg|gif|svg|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(api|app)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=60" }],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
