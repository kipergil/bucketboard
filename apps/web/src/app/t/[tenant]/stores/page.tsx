import Link from 'next/link';
import type { Metadata } from 'next';
import { getTenantBySlug } from '@/services/tenants';
import { listStoreDirectory, listCities } from '@/services/stores';
import { storeDirectoryQuerySchema } from '@bucketboard/shared';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Stores' };

export default async function StoresDirectoryPage({
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

  const query = storeDirectoryQuerySchema.parse(raw);
  const [{ stores, total }, cities] = await Promise.all([
    listStoreDirectory({
      tagSlug: raw.tag,
      city: query.city,
      openNow: query.openNow,
      page: query.page,
    }),
    listCities(),
  ]);

  const pageSize = 24;

  function buildHref(page: number): string {
    const params = new URLSearchParams();
    if (raw.tag) params.set('tag', raw.tag);
    if (query.city) params.set('city', query.city);
    if (query.openNow) params.set('openNow', 'true');
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/t/${tenantSlug}/stores${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Physical stores</h1>

      <form method="get" className="flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">City</span>
          <select
            name="city"
            defaultValue={query.city ?? ''}
            className="border-input bg-background h-9 rounded-md border px-2"
          >
            <option value="">Any</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="openNow"
            value="true"
            defaultChecked={query.openNow}
            className="size-4"
          />
          <span>Open now</span>
        </label>
        <button type="submit" className="bg-primary text-primary-foreground h-9 rounded-md px-3">
          Filter
        </button>
      </form>

      {stores.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {stores.map((store) => (
            <li key={store.id}>
              <Link
                href={`/t/${tenant.slug}/s/${store.retailerSlug}/${store.slug}`}
                className="block rounded-lg border p-4 hover:shadow-sm"
              >
                <p className="font-medium">{store.name}</p>
                <p className="text-muted-foreground text-sm">{store.retailerName}</p>
                <p className="text-muted-foreground text-sm">
                  {store.city}, {store.postcode}
                </p>
                <Badge
                  variant={store.status === 'published' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {store.city}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No stores match those filters.</p>
      )}

      <Pagination page={query.page} pageSize={pageSize} total={total} buildHref={buildHref} />
    </div>
  );
}
