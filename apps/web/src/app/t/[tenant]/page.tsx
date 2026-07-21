import Link from 'next/link';
import { getTenantBySlug } from '@/services/tenants';
import { getCategoryTree } from '@/services/categories';
import { listTrendingItems, listNewestItems } from '@/services/items';
import { listRetailers } from '@/services/retailers';
import { ItemCard } from '@/components/item/item-card';
import { CategoryGrid } from '@/components/category/category-grid';
import { RetailerCard } from '@/components/retailer/retailer-card';

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return null;

  const [categories, trending, newest, { retailers }] = await Promise.all([
    getCategoryTree(tenant.id),
    listTrendingItems(tenant.id, 8),
    listNewestItems(tenant.id, 8),
    listRetailers({ pageSize: 8 }),
  ]);

  const topLevelCategories = categories.filter((c) => c.depth === 0);

  return (
    <div className="space-y-14 sm:space-y-16">
      <section className="bg-hero-wash relative -mx-4 overflow-hidden rounded-none px-4 py-10 sm:mx-0 sm:rounded-3xl sm:px-10 sm:py-14">
        <p className="text-primary mb-3 text-xs font-semibold uppercase tracking-widest">
          Community favourites
        </p>
        <h1 className="font-heading max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          What real shoppers keep coming back to at {tenant.name}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl text-pretty text-base sm:text-lg">
          Browse, vote, and discover the picks other members love — then see exactly where to buy
          them.
        </p>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
              Explore
            </p>
            <h2 className="font-heading mt-1 text-xl font-bold sm:text-2xl">Browse categories</h2>
          </div>
        </div>
        <CategoryGrid categories={topLevelCategories} tenantSlug={tenant.slug} />
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-widest">
              Hot right now
            </p>
            <h2 className="font-heading mt-1 text-xl font-bold sm:text-2xl">Trending</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {trending.map((item) => (
            <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
              Just added
            </p>
            <h2 className="font-heading mt-1 text-xl font-bold sm:text-2xl">Newest</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {newest.map((item) => (
            <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
              Where to shop
            </p>
            <h2 className="font-heading mt-1 text-xl font-bold sm:text-2xl">Featured shops</h2>
          </div>
          <Link
            href={`/t/${tenant.slug}/shops`}
            className="text-primary shrink-0 text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {retailers.map((retailer) => (
            <RetailerCard key={retailer.id} retailer={retailer} tenantSlug={tenant.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
