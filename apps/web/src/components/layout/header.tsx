import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { SearchBar } from './search-bar';
import { MobileNav } from './mobile-nav';
import type { TenantContextValue } from '@/lib/tenant/context';

export function Header({ tenant }: { tenant: TenantContextValue }) {
  const base = `/t/${tenant.slug}`;
  const initial = tenant.name.charAt(0).toUpperCase();

  return (
    <header className="bg-background/90 supports-backdrop-filter:bg-background/70 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <MobileNav tenant={tenant} />

        <Link href={base} className="flex shrink-0 items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
            {initial}
          </span>
          <span className="font-heading hidden text-lg font-bold tracking-tight sm:inline">
            {tenant.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium sm:flex" aria-label="Primary">
          <Link
            href={`${base}/shops`}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-2.5 py-1.5 transition-colors"
          >
            Shops
          </Link>
          <Link
            href={`${base}/stores`}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-2.5 py-1.5 transition-colors"
          >
            Stores
          </Link>
        </nav>

        <div className="hidden flex-1 sm:block sm:max-w-sm">
          <SearchBar tenantSlug={tenant.slug} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            render={
              <Link href={`${base}/submit`}>
                <PlusCircle data-icon="inline-start" />
                Submit
              </Link>
            }
          />
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
