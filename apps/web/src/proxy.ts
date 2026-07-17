import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { getTenantByDomain } from './services/tenants';

const GLOBAL_PREFIXES = [
  '/go/',
  '/api/',
  '/sign-in',
  '/sign-up',
  '/_next/',
  '/favicon.ico',
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.webmanifest',
];

const DEV_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

/**
 * Resolves the current tenant by hostname (production custom domains) and
 * rewrites the request into the `/t/[tenant]/...` route tree — the URL
 * bar keeps the visitor's real domain, only the internal Next.js
 * resolution changes. `/t/[slug]/...` is also directly reachable (the dev
 * fallback from the spec) and passes through untouched. Global routes
 * (outbound redirect, webhooks, Clerk auth, static assets) are never
 * tenant-rewritten. Wrapped in clerkMiddleware so `auth()` works in every
 * Server Component / Server Action / Route Handler downstream.
 */
export default clerkMiddleware(async (_auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (GLOBAL_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/t/')) {
    return NextResponse.next();
  }

  const hostname = request.headers.get('host')?.split(':')[0] ?? '';

  if (DEV_HOSTNAMES.has(hostname)) {
    const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG;
    if (defaultSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `/t/${defaultSlug}${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const tenant = await getTenantByDomain(hostname);
  if (!tenant) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/t/${tenant.slug}${pathname}`;
  return NextResponse.rewrite(url);
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
