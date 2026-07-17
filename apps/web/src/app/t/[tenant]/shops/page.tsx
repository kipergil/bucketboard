import type { Metadata } from 'next';
import { getTenantBySlug } from '@/services/tenants';
import { listRetailers } from '@/services/retailers';
import { retailerDirectoryQuerySchema, RETAILER_TYPE, RETAILER_KIND } from '@bucketboard/shared';
import { RetailerCard } from '@/components/retailer/retailer-card';
import { Pagination } from '@/components/pagination';

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
      <h1 className="text-2xl font-bold">Shops</h1>

      <form method="get" className="flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">Type</span>
          <select
            name="type"
            defaultValue={query.type ?? ''}
            className="border-input bg-background h-9 rounded-md border px-2"
          >
            <option value="">Any</option>
            {RETAILER_TYPE.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">Kind</span>
          <select
            name="kind"
            defaultValue={query.kind ?? ''}
            className="border-input bg-background h-9 rounded-md border px-2"
          >
            <option value="">Any</option>
            {RETAILER_KIND.map((kind) => (
              <option key={kind} value={kind}>
                {kind.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="bg-primary text-primary-foreground h-9 rounded-md px-3">
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
        <p className="text-muted-foreground">No shops match those filters.</p>
      )}

      <Pagination page={query.page} pageSize={pageSize} total={total} buildHref={buildHref} />
    </div>
  );
}
