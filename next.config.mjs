import { fileURLToPath } from "node:url";
import createJiti from "jiti";
import { createSecureHeaders } from "next-secure-headers";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti("./lib/zod");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        locale: false,
        source: "/(.*)",
        headers: createSecureHeaders({
          frameGuard: false,
          noopen: "noopen",
          nosniff: "nosniff",
          xssProtection: "sanitize",
          forceHTTPSRedirect: [
            true,
            { maxAge: 60 * 60 * 24 * 360, includeSubDomains: true },
          ],
          referrerPolicy: "same-origin",
          contentSecurityPolicy: {
            directives: {
              connectSrc: ["*"],
            },
          },
        }),
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/farcaster/miniapp",
        destination: `https://farcaster.xyz/?launchFrameUrl=${process.env.NEXT_PUBLIC_URL}`,
        permanent: true,
      },
    ];
  },
  // PostHog configs
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  // reown
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
