/**
 * Simple env-driven feature flags. Deliberately NOT `server-only` — these
 * read `NEXT_PUBLIC_*` vars directly (rather than going through the
 * validated `getServerEnv()`) so the same constant can be imported from
 * both Server and Client Components; Next.js inlines the literal
 * `process.env.NEXT_PUBLIC_*` reference at build time either way.
 */

/**
 * Affiliate disclosure links in the footer and mobile nav. Off by default
 * — the page itself (and the ASA/CMA-required disclosure note next to
 * offer links) stays live either way; this only controls whether it's
 * linked from navigation. Set NEXT_PUBLIC_SHOW_AFFILIATE_DISCLOSURE=true
 * to bring the nav links back.
 */
export const SHOW_AFFILIATE_DISCLOSURE =
  process.env.NEXT_PUBLIC_SHOW_AFFILIATE_DISCLOSURE === 'true';
