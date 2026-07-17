import type { NextConfig } from 'next';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055';
const directusHost = new URL(directusUrl);
const isLocalDirectus = ['localhost', '127.0.0.1'].includes(directusHost.hostname);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: directusHost.protocol.replace(':', '') as 'http' | 'https',
        hostname: directusHost.hostname,
        port: directusHost.port,
        pathname: '/assets/**',
      },
    ],
    // Seed data uses generated SVG placeholders for retailer logos/item images.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // next/image's optimizer refuses to fetch upstream images that resolve
    // to a private IP (SSRF protection) — localhost:8055 always does. Only
    // relevant for local dev against a locally-run Directus; a real
    // deployment's Directus has a public/routable hostname and keeps
    // optimization on.
    unoptimized: isLocalDirectus,
  },
};

export default nextConfig;
