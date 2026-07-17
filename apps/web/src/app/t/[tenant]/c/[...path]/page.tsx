import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTenantBySlug } from '@/services/tenants';
import { getCategoryByPath, getCategoryTree } from '@/services/categories';
import { listItemsInCategorySubtree } from '@/services/items';
import { listRetailers } from '@/services/retailers';
import { categoryQuerySchema } from '@bucketboard/shared';
import {
  CategoryBreadcrumb,
  type BreadcrumbSegment,
} from '@/components/category/category-breadcrumb';
import { CategoryGrid } from '@/components/category/category-grid';
import { SortToolbar } from '@/components/category/sort-toolbar';
import { RetailerFilter } from '@/components/category/retailer-filter';
import { ItemCard } from '@/components/item/item-card';
import { Pagination } from '@/components/pagination';
import { CategoryJsonLd } from '@/components/seo/json-ld';

interface CategoryPageProps {
  params: Promise<{ tenant: string; path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function loadCategoryPage(props: CategoryPageProps) {
  const { tenant: tenantSlug, path } = await props.params;
  const rawSearchParams = await props.searchParams;
  const categoryPath = path.join('/');

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;

  const category = await getCategoryByPath(tenant.id, categoryPath);
  if (!category) return null;

  const query = categoryQuerySchema.parse({
    sort: rawSearchParams.sort,
    retailer: rawSearchParams.retailer,
    page: rawSearchParams.page,
  });

  return { tenant, category, query };
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const loaded = await loadCategoryPage(props);
  if (!loaded) return {};
  const { category } = loaded;
  return {
    title: category.name,
    description:
      category.description ??
      `Browse ${category.name} — community-rated picks and where to buy them.`,
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const loaded = await loadCategoryPage(props);
  if (!loaded) notFound();
  const { tenant, category, query } = loaded;

  const [tree, { items, total }, { retailers }] = await Promise.all([
    getCategoryTree(tenant.id),
    listItemsInCategorySubtree(tenant.id, category.path, {
      sort: query.sort,
      page: query.page,
      retailerSlug: query.retailer,
    }),
    listRetailers({ pageSize: 100 }),
  ]);

  const childCategories = tree.filter((c) => c.parent === category.id);

  const segments: BreadcrumbSegment[] = category.path
    .split('/')
    .reduce<BreadcrumbSegment[]>((acc, slug, index) => {
      const path = category.path
        .split('/')
        .slice(0, index + 1)
        .join('/');
      const node = tree.find((c) => c.path === path);
      acc.push({ name: node?.name ?? slug, path });
      return acc;
    }, []);

  const pageSize = 24;

  function buildHref(page: number): string {
    const params = new URLSearchParams();
    if (query.sort !== 'top_all') params.set('sort', query.sort);
    if (query.retailer) params.set('retailer', query.retailer);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/t/${tenant.slug}/c/${category.path}${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="space-y-6">
      <CategoryJsonLd tenant={tenant} segments={segments} />
      <CategoryBreadcrumb tenantSlug={tenant.slug} segments={segments} />

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{category.name}</h1>
        {category.description ? (
          <p className="text-muted-foreground mt-1">{category.description}</p>
        ) : null}
      </div>

      {childCategories.length > 0 ? (
        <CategoryGrid categories={childCategories} tenantSlug={tenant.slug} />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-muted-foreground text-sm">{total} items</p>
        <div className="flex items-center gap-3">
          <RetailerFilter retailerSlugs={retailers.map((r) => r.slug)} />
          <SortToolbar currentSort={query.sort} />
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-12 text-center">
          No items here yet — be the first to submit one.
        </p>
      )}

      <Pagination page={query.page} pageSize={pageSize} total={total} buildHref={buildHref} />
    </div>
  );
}
