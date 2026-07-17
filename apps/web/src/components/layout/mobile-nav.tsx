'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Menu, X, Store, Building2, Info, ShieldCheck, PlusCircle } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { SearchBar } from './search-bar';
import type { TenantContextValue } from '@/lib/tenant/context';

const NAV_LINKS = [
  { href: '/shops', label: 'Shops', icon: Store },
  { href: '/stores', label: 'Stores', icon: Building2 },
  { href: '/about', label: 'About', icon: Info },
  { href: '/affiliate-disclosure', label: 'Affiliate disclosure', icon: ShieldCheck },
];

/**
 * Full-height slide-in drawer for small screens — consolidates search, nav
 * links, the submit CTA, and auth into one place, since the header itself
 * only has room for a logo and a trigger button below `sm`.
 */
export function MobileNav({ tenant }: { tenant: TenantContextValue }) {
  const base = `/t/${tenant.slug}`;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        render={<Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open menu" />}
      >
        <Menu />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 backdrop-blur-xs fixed inset-0 z-50 bg-black/30 duration-150 sm:hidden" />
        <DialogPrimitive.Popup className="data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right bg-background fixed inset-y-0 right-0 z-50 flex h-full w-[85%] max-w-sm flex-col gap-6 overflow-y-auto p-5 shadow-2xl duration-200 sm:hidden">
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="font-heading text-lg font-semibold">
              Menu
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={<Button variant="ghost" size="icon-sm" aria-label="Close menu" />}
            >
              <X />
            </DialogPrimitive.Close>
          </div>

          <SearchBar tenantSlug={tenant.slug} onNavigate={close} />

          <nav className="flex flex-col gap-1" aria-label="Primary">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={`${base}${href}`}
                onClick={close}
                className="hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors"
              >
                <Icon className="text-muted-foreground size-4.5" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t pt-4">
            <Button
              size="lg"
              onClick={close}
              render={
                <Link href={`${base}/submit`}>
                  <PlusCircle data-icon="inline-start" />
                  Submit an item
                </Link>
              }
            />
            <SignedIn>
              <div className="flex items-center gap-2.5 px-1">
                <UserButton afterSignOutUrl={base} />
                <span className="text-muted-foreground text-sm">Your account</span>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
