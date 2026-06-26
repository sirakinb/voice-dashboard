import type { NextConfig } from "next";

/** Origins allowed to invoke Server Actions (Data Chat, report insights). */
function getServerActionAllowedOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://localhost:10000",
    "http://localhost:23000",
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl.trim()).origin);
    } catch {
      // ignore invalid URL
    }
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`);
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: getServerActionAllowedOrigins(),
    },
  },
};

export default nextConfig;
