import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getTenantByDomain, getTenantBySlug } from '@/services/tenants';
import { getCategoryTree } from '@/services/categories';
import { listRetailers, listRetailerLocations } from '@/services/retailers';
import { listItemsInCategorySubtree } from '@/services/items';

async function resolveTenantForRequest() {
  const headerList = await headers();
  const host = headerList.get('host')?.split(':')[0] ?? '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return getTenantBySlug(process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? 'supermarket');
  }
  return (
    (await getTenantByDomain(host)) ??
    getTenantBySlug(process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? 'supermarket')
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await resolveTenantForRequest();
  if (!tenant) return [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const base = `${siteUrl}/t/${tenant.slug}`;

  const [categories, { retailers }] = await Promise.all([
    getCategoryTree(tenant.id),
    listRetailers({ pageSize: 200 }),
  ]);

  const entries: MetadataRoute.Sitemap = [{ url: base, changeFrequency: 'daily', priority: 1 }];

  for (const category of categories) {
    entries.push({ url: `${base}/c/${category.path}`, changeFrequency: 'daily', priority: 0.8 });
  }

  for (const retailer of retailers) {
    entries.push({ url: `${base}/s/${retailer.slug}`, changeFrequency: 'weekly', priority: 0.6 });
    const locations = await listRetailerLocations(retailer.id);
    for (const location of locations) {
      entries.push({
        url: `${base}/s/${retailer.slug}/${location.slug}`,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  const topLevelCategories = categories.filter((c) => c.depth === 0);
  for (const category of topLevelCategories) {
    const { items } = await listItemsInCategorySubtree(tenant.id, category.path, { pageSize: 100 });
    for (const item of items) {
      entries.push({
        url: `${base}/i/${item.slug}`,
        lastModified: item.date_created ?? undefined,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
