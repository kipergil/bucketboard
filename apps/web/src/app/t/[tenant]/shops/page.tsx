import Link from 'next/link';
import type { Metadata } from 'next';
import { Store } from 'lucide-react';
import { getTenantBySlug } from '@/services/tenants';
import { listRetailers } from '@/services/retailers';
import { retailerDirectoryQuerySchema, RETAILER_TYPE, RETAILER_KIND } from '@bucketboard/shared';
import { RetailerCard } from '@/components/retailer/retailer-card';
import { Pagination } from '@/components/pagination';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Shops' };

export default async function ShopsDirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { tenant: tenantSlug } = await params;
  const raw = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;

  const query = retailerDirectoryQuerySchema.parse(raw);
  const { retailers, total } = await listRetailers({
    type: query.type,
    kind: query.kind,
    tagSlug: query.tag,
    country: query.country,
    page: query.page,
  });

  const pageSize = 24;

  function buildHref(page: number): string {
    const params = new URLSearchParams();
    if (query.type) params.set('type', query.type);
    if (query.kind) params.set('kind', query.kind);
    if (query.tag) params.set('tag', query.tag);
    if (query.country) params.set('country', query.country);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/t/${tenantSlug}/shops${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Shops</h1>

      <form
        method="get"
        className="bg-muted/50 flex flex-wrap items-end gap-4 rounded-xl border p-4 text-sm"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Type</span>
          <select
            name="type"
            defaultValue={query.type ?? ''}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 h-9 rounded-lg border px-2.5 capitalize outline-none"
          >
            <option value="">Any</option>
            {RETAILER_TYPE.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Kind</span>
          <select
            name="kind"
            defaultValue={query.kind ?? ''}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 h-9 rounded-lg border px-2.5 capitalize outline-none"
          >
            <option value="">Any</option>
            {RETAILER_KIND.map((kind) => (
              <option key={kind} value={kind} className="capitalize">
                {kind.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={cn(buttonVariants({ size: 'default' }))}>
          Filter
        </button>
      </form>

      <p className="text-muted-foreground text-sm">{total} shops</p>

      {retailers.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {retailers.map((retailer) => (
            <RetailerCard key={retailer.id} retailer={retailer} tenantSlug={tenant.slug} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Store}
          title="No shops match those filters"
          description="Try a different type or kind, or clear the filters to see every shop."
          action={
            <Link href={`/t/${tenant.slug}/shops`} className={cn(buttonVariants({ size: 'sm' }))}>
              Clear filters
            </Link>
          }
        />
      )}

      <Pagination page={query.page} pageSize={pageSize} total={total} buildHref={buildHref} />
    </div>
  );
}
