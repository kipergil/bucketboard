import { redirect } from 'next/navigation';

/**
 * Reached only when middleware couldn't resolve a tenant for this host
 * (an unrecognised domain, or a preview deployment before DNS is wired
 * up) — middleware rewrites every other case straight into
 * `/t/[tenant]/...`. Falls back to the default tenant for convenience.
 */
export default function RootPage() {
  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? 'supermarket';
  redirect(`/t/${defaultSlug}`);
}
