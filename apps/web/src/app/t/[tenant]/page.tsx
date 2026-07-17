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
    <div className="space-y-10">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Browse categories</h1>
        <CategoryGrid categories={topLevelCategories} tenantSlug={tenant.slug} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trending now</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {trending.map((item) => (
            <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Newest</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {newest.map((item) => (
            <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured shops</h2>
          <Link href={`/t/${tenant.slug}/shops`} className="text-primary text-sm hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {retailers.map((retailer) => (
            <RetailerCard key={retailer.id} retailer={retailer} tenantSlug={tenant.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
