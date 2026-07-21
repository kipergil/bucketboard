import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ExternalLink, PackageSearch } from 'lucide-react';
import { getTenantBySlug } from '@/services/tenants';
import { getRetailerBySlug, listRetailerLocations } from '@/services/retailers';
import { listItemsForRetailer } from '@/services/items';
import { assetUrl } from '@/lib/directus/assets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/item/item-card';
import { Pagination } from '@/components/pagination';
import { RetailerJsonLd } from '@/components/seo/json-ld';
import { EmptyState } from '@/components/ui/empty-state';

interface RetailerPageProps {
  params: Promise<{ tenant: string; retailer: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}

async function load(props: RetailerPageProps) {
  const { tenant: tenantSlug, retailer: retailerSlug } = await props.params;
  const search = await props.searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;
  const retailer = await getRetailerBySlug(retailerSlug);
  if (!retailer) return null;
  return { tenant, retailer, categoryPath: search.category, page: Number(search.page ?? '1') || 1 };
}

export async function generateMetadata(props: RetailerPageProps): Promise<Metadata> {
  const loaded = await load(props);
  if (!loaded) return {};
  return { title: loaded.retailer.name, description: loaded.retailer.description ?? undefined };
}

export default async function RetailerPage(props: RetailerPageProps) {
  const loaded = await load(props);
  if (!loaded) notFound();
  const { tenant, retailer, categoryPath, page } = loaded;

  const [locations, { items, total, pageSize }] = await Promise.all([
    listRetailerLocations(retailer.id),
    listItemsForRetailer(retailer.id, { categoryPath, page }),
  ]);

  const logo = assetUrl(retailer.logo, 'thumb');
  const cover = assetUrl(retailer.cover, 'cover');

  function buildHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (categoryPath) params.set('category', categoryPath);
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    return `/t/${tenant.slug}/s/${retailer.slug}${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="space-y-6">
      <RetailerJsonLd retailer={retailer} />

      {cover ? (
        <div className="bg-muted aspect-3/1 relative w-full overflow-hidden rounded-lg">
          <Image src={cover} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {logo ? (
            <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-full">
              <Image src={logo} alt="" fill sizes="64px" className="object-cover" />
            </div>
          ) : null}
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">{retailer.name}</h1>
            <div className="mt-1 flex gap-1.5">
              <Badge variant="secondary">{retailer.kind.replace('_', ' ')}</Badge>
              <Badge variant="outline">{retailer.type}</Badge>
            </div>
          </div>
        </div>
        {retailer.website ? (
          <Button
            size="lg"
            render={
              <Link href={retailer.website} target="_blank" rel="noopener noreferrer nofollow">
                Visit website
                <ExternalLink data-icon="inline-end" />
              </Link>
            }
          />
        ) : null}
      </div>

      {retailer.description ? (
        <p className="text-muted-foreground max-w-2xl">{retailer.description}</p>
      ) : null}

      {locations.length > 0 ? (
        <section>
          <h2 className="font-heading mb-3 text-lg font-semibold">Locations</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {locations.map((location) => (
              <li key={location.id}>
                <Link
                  href={`/t/${tenant.slug}/s/${retailer.slug}/${location.slug}`}
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

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Items at {retailer.name}</h2>
          <p className="text-muted-foreground text-sm">{total} items</p>
        </div>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No items yet"
            description={`No community favourites have been linked to ${retailer.name} yet.`}
          />
        )}
        <Pagination page={page} pageSize={pageSize} total={total} buildHref={buildHref} />
      </section>
    </div>
  );
}
