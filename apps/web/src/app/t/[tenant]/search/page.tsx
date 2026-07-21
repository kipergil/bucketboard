import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchX, Search } from 'lucide-react';
import { getTenantBySlug } from '@/services/tenants';
import { searchTenant } from '@/services/search';
import { searchQuerySchema } from '@bucketboard/shared';
import { ItemCard } from '@/components/item/item-card';
import { RetailerCard } from '@/components/retailer/retailer-card';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string; category?: string; retailer?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const raw = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;

  const parsed = searchQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Search</h1>
        <EmptyState
          icon={Search}
          title="Search for items, shops, or stores"
          description="Enter a search term above to get started."
        />
      </div>
    );
  }

  const results = await searchTenant(tenant.id, parsed.data.q, {
    categoryPath: parsed.data.category,
    retailerSlug: parsed.data.retailer,
  });

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Results for &ldquo;{parsed.data.q}&rdquo;
      </h1>

      {results.items.length > 0 ? (
        <section>
          <h2 className="font-heading mb-3 text-lg font-semibold">Items</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {results.items.map((item) => (
              <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {results.retailers.length > 0 ? (
        <section>
          <h2 className="font-heading mb-3 text-lg font-semibold">Shops</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {results.retailers.map((retailer) => (
              <RetailerCard key={retailer.id} retailer={retailer} tenantSlug={tenant.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {results.locations.length > 0 ? (
        <section>
          <h2 className="font-heading mb-3 text-lg font-semibold">Stores</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {results.locations.map((location) => (
              <li key={location.id}>
                <Link
                  href={`/t/${tenant.slug}/stores`}
                  className="hover:border-primary/30 group block rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="group-hover:text-primary font-medium transition-colors">
                    {location.name}
                  </p>
                  <p className="text-muted-foreground text-sm">{location.city}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.items.length === 0 &&
      results.retailers.length === 0 &&
      results.locations.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No results found"
          description={`We couldn't find anything for "${parsed.data.q}". Try a different search term.`}
        />
      ) : null}
    </div>
  );
}
