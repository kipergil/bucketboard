import 'server-only';
import { readItems, withOptions } from '@directus/sdk';
import type { RetailerLocation } from '@bucketboard/shared';
import { getPublicDirectusClient } from '../lib/directus/client';
import { isStoreOpenNow } from './openingHours';

export interface StoreDirectoryOptions {
  tagSlug?: string;
  city?: string;
  openNow?: boolean;
  page?: number;
  pageSize?: number;
}

export interface StoreDirectoryEntry extends RetailerLocation {
  retailerName: string;
  retailerSlug: string;
}

export async function listStoreDirectory(
  options: StoreDirectoryOptions = {},
): Promise<{ stores: StoreDirectoryEntry[]; total: number }> {
  const client = getPublicDirectusClient();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;

  const filter: Record<string, unknown> = { status: { _eq: 'published' } };
  if (options.city) filter.city = { _eq: options.city };
  if (options.tagSlug) filter.retailer = { tags: { tag: { slug: { _eq: options.tagSlug } } } };

  const [rows, meta] = await Promise.all([
    client.request(
      withOptions(
        readItems('retailer_locations', {
          filter,
          fields: ['*', { retailer: ['name', 'slug'] }],
          sort: ['name'],
          page,
          limit: options.openNow ? -1 : pageSize,
        }),
        { next: { revalidate: 300, tags: ['stores'] } },
      ),
    ),
    client.request(
      withOptions(
        readItems('retailer_locations', { filter, aggregate: { count: '*' }, limit: 1 }),
        {
          next: { revalidate: 300, tags: ['stores'] },
        },
      ),
    ),
  ]);

  type RawRow = RetailerLocation & { retailer: { name: string; slug: string } | string };
  let entries: StoreDirectoryEntry[] = (rows as RawRow[]).map((row) => {
    const retailer = typeof row.retailer === 'object' ? row.retailer : { name: '', slug: '' };
    return { ...row, retailerName: retailer.name, retailerSlug: retailer.slug };
  });

  if (options.openNow) {
    entries = entries.filter((store) => isStoreOpenNow(store.opening_hours));
    const total = entries.length;
    const start = (page - 1) * pageSize;
    return { stores: entries.slice(start, start + pageSize), total };
  }

  const total = Number((meta as unknown as Array<{ count: string }>)[0]?.count ?? 0);
  return { stores: entries, total };
}

export async function listCities(): Promise<string[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('retailer_locations', {
        filter: { status: { _eq: 'published' } },
        fields: ['city'],
        limit: -1,
      }),
      { next: { revalidate: 3600, tags: ['stores'] } },
    ),
  );
  const cities = new Set(
    (rows as Array<{ city: string | null }>).map((r) => r.city).filter(Boolean),
  );
  return Array.from(cities as Set<string>).sort();
}
