import Link from 'next/link';
import type { TenantContextValue } from '@/lib/tenant/context';

export function Footer({ tenant }: { tenant: TenantContextValue }) {
  const base = `/t/${tenant.slug}`;

  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {tenant.name}
        </p>
        <nav className="flex flex-wrap gap-4" aria-label="Footer">
          <Link href={`${base}/about`} className="hover:text-foreground">
            About
          </Link>
          <Link href={`${base}/affiliate-disclosure`} className="hover:text-foreground">
            Affiliate disclosure
          </Link>
          <Link href={`${base}/shops`} className="hover:text-foreground">
            Shops
          </Link>
          <Link href={`${base}/stores`} className="hover:text-foreground">
            Stores
          </Link>
        </nav>
      </div>
    </footer>
  );
}
