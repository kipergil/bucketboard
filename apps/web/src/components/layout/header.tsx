import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { SearchBar } from './search-bar';
import type { TenantContextValue } from '@/lib/tenant/context';

export function Header({ tenant }: { tenant: TenantContextValue }) {
  const base = `/t/${tenant.slug}`;

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href={base} className="text-lg font-bold tracking-tight">
          {tenant.name}
        </Link>

        <nav
          className="ml-2 hidden items-center gap-4 text-sm font-medium sm:flex"
          aria-label="Primary"
        >
          <Link href={`${base}/shops`} className="text-muted-foreground hover:text-foreground">
            Shops
          </Link>
          <Link href={`${base}/stores`} className="text-muted-foreground hover:text-foreground">
            Stores
          </Link>
        </nav>

        <div className="mx-auto min-w-0 flex-1 sm:mx-0 sm:max-w-sm">
          <SearchBar tenantSlug={tenant.slug} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" render={<Link href={`${base}/submit`}>Submit</Link>} />
          <SignedIn>
            <UserButton afterSignOutUrl={base} />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
