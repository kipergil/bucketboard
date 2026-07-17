import type { Metadata } from 'next';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { getTenantBySlug } from '@/services/tenants';
import { getCategoryTree, getAllAttributeDefinitions } from '@/services/categories';
import { listRetailers } from '@/services/retailers';
import { SubmitItemForm } from '@/components/submit/submit-item-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Submit an item' };

export default async function SubmitPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;

  const [categories, attributeDefinitions, { retailers }] = await Promise.all([
    getCategoryTree(tenant.id),
    getAllAttributeDefinitions(tenant.id),
    listRetailers({ pageSize: 200 }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Submit an item</h1>

      <SignedOut>
        <p className="text-muted-foreground">Sign in to submit an item.</p>
        <SignInButton mode="modal">
          <Button>Sign in</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SubmitItemForm
          tenantSlug={tenant.slug}
          categories={categories}
          attributeDefinitions={attributeDefinitions}
          retailers={retailers.map((r) => ({ id: r.id, name: r.name, slug: r.slug }))}
        />
      </SignedIn>
    </div>
  );
}
