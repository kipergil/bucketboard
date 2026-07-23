import Link from 'next/link';
import { SHOW_AFFILIATE_DISCLOSURE } from '@/lib/featureFlags';
import type { TenantContextValue } from '@/lib/tenant/context';

export function Footer({ tenant }: { tenant: TenantContextValue }) {
  const base = `/t/${tenant.slug}`;

  return (
    <footer className="bg-secondary/40 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-base font-semibold">{tenant.name}</p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Community favourites, picked by real shoppers.
            </p>
          </div>
          <nav
            className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-sm"
            aria-label="Footer"
          >
            <Link href={`${base}/shops`} className="hover:text-foreground transition-colors">
              Shops
            </Link>
            <Link href={`${base}/stores`} className="hover:text-foreground transition-colors">
              Stores
            </Link>
            <Link href={`${base}/about`} className="hover:text-foreground transition-colors">
              About
            </Link>
            {SHOW_AFFILIATE_DISCLOSURE ? (
              <Link
                href={`${base}/affiliate-disclosure`}
                className="hover:text-foreground transition-colors"
              >
                Affiliate disclosure
              </Link>
            ) : null}
          </nav>
        </div>
        <p className="text-muted-foreground border-t pt-4 text-xs">
          &copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
