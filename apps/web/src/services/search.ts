import 'server-only';
import { readItems } from '@directus/sdk';
import type { Item, Retailer, RetailerLocation } from '@bucketboard/shared';
import { getPublicDirectusClient } from '../lib/directus/client';

export interface SearchResults {
  items: Item[];
  retailers: Retailer[];
  locations: RetailerLocation[];
}

export async function searchTenant(
  tenantId: string,
  query: string,
  options: { categoryPath?: string; retailerSlug?: string } = {},
): Promise<SearchResults> {
  const client = getPublicDirectusClient();

  const itemFilter: Record<string, unknown> = {
    tenant: { _eq: tenantId },
    status: { _eq: 'published' },
  };
  if (options.categoryPath) {
    itemFilter._or = [
      { category: { path: { _eq: options.categoryPath } } },
      { category: { path: { _starts_with: `${options.categoryPath}/` } } },
    ];
  }
  if (options.retailerSlug) {
    // No `status` filter here — the Public policy's item_offers field
    // allow-list doesn't include it (see services/items.ts), and the
    // policy's row-level rule already scopes reads to published offers.
    itemFilter.offers = { retailer: { slug: { _eq: options.retailerSlug } } };
  }

  const [items, retailers, locations] = await Promise.all([
    client.request(
      readItems('items', {
        filter: itemFilter,
        search: query,
        fields: [
          'id',
          'tenant',
          'category',
          'title',
          'slug',
          'url',
          'image',
          'body',
          'brand',
          'status',
          'vote_score',
          'votes_up',
          'votes_down',
          'comment_count',
          'offer_count',
          'hot_score',
        ],
        limit: 20,
      }),
    ),
    client.request(
      readItems('retailers', {
        filter: { status: { _eq: 'published' } },
        search: query,
        limit: 10,
      }),
    ),
    client.request(
      readItems('retailer_locations', {
        filter: { status: { _eq: 'published' } },
        search: query,
        limit: 10,
      }),
    ),
  ]);

  return {
    items: items as Item[],
    retailers: retailers as Retailer[],
    locations: locations as RetailerLocation[],
  };
}
