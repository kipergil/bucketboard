import 'server-only';
import { createItem, readItem, readItems, withOptions } from '@directus/sdk';
import type { AttributeValue, Item, ItemAttribute, ItemOffer } from '@bucketboard/shared';
import type { ItemSort } from '@bucketboard/shared';
import { getPublicDirectusClient, getServiceDirectusClient } from '../lib/directus/client';

const ITEM_FIELDS = [
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
  'date_created',
] as const;

export interface ListItemsOptions {
  sort?: ItemSort;
  page?: number;
  pageSize?: number;
  /** Only items with a published offer at this retailer slug. */
  retailerSlug?: string;
}

export interface ListItemsResult {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}

function sortWindowFilter(sort: ItemSort): Record<string, unknown> | null {
  if (sort === 'top_week') {
    return { date_created: { _gte: new Date(Date.now() - 7 * 86_400_000).toISOString() } };
  }
  if (sort === 'top_month') {
    return { date_created: { _gte: new Date(Date.now() - 30 * 86_400_000).toISOString() } };
  }
  return null;
}

function sortField(sort: ItemSort): '-date_created' | '-vote_score' {
  if (sort === 'new') return '-date_created';
  return '-vote_score';
}

/**
 * Lists published items in a category subtree (matched via the category's
 * materialized `path`, prefix-matching descendants). `sort` covers
 * top-all/top-month/top-week (approximated as "posted within the window,
 * ranked by vote_score" — true per-period vote windowing would need a
 * separate vote-time-series aggregation, out of scope here) and `new`.
 */
export async function listItemsInCategorySubtree(
  tenantId: string,
  categoryPath: string,
  options: ListItemsOptions = {},
): Promise<ListItemsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;
  const sort = options.sort ?? 'top_all';

  const client = getPublicDirectusClient();

  const filter: Record<string, unknown> = {
    tenant: { _eq: tenantId },
    status: { _eq: 'published' },
    _or: [
      { category: { path: { _eq: categoryPath } } },
      { category: { path: { _starts_with: `${categoryPath}/` } } },
    ],
    ...(sortWindowFilter(sort) ?? {}),
  };

  if (options.retailerSlug) {
    // No `status` here — see the comment in getOffersForItem: the Public
    // policy's item_offers field allow-list doesn't include it, so
    // filtering on it 403s. The policy's row-level rule already scopes
    // reads to published offers.
    filter.offers = { retailer: { slug: { _eq: options.retailerSlug } } };
  }

  const [rows, meta] = await Promise.all([
    client.request(
      withOptions(
        readItems('items', {
          filter,
          fields: ITEM_FIELDS,
          sort: [sortField(sort)],
          page,
          limit: pageSize,
        }),
        { next: { revalidate: 60, tags: [`items:${tenantId}`] } },
      ),
    ),
    client.request(
      withOptions(readItems('items', { filter, aggregate: { count: '*' }, limit: 1 }), {
        next: { revalidate: 60, tags: [`items:${tenantId}`] },
      }),
    ),
  ]);

  const total = Number((meta as unknown as Array<{ count: string }>)[0]?.count ?? 0);
  return { items: rows as Item[], total, page, pageSize };
}

/** Items with at least one published offer at the given retailer — powers the retailer landing page. */
export async function listItemsForRetailer(
  retailerId: string,
  options: { categoryPath?: string; page?: number; pageSize?: number } = {},
): Promise<ListItemsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;
  const client = getPublicDirectusClient();

  const filter: Record<string, unknown> = {
    status: { _eq: 'published' },
    offers: { retailer: { _eq: retailerId } },
  };
  if (options.categoryPath) {
    filter._or = [
      { category: { path: { _eq: options.categoryPath } } },
      { category: { path: { _starts_with: `${options.categoryPath}/` } } },
    ];
  }

  const [rows, meta] = await Promise.all([
    client.request(
      withOptions(
        readItems('items', {
          filter,
          fields: ITEM_FIELDS,
          sort: ['-vote_score'],
          page,
          limit: pageSize,
        }),
        { next: { revalidate: 300, tags: [`retailer-items:${retailerId}`] } },
      ),
    ),
    client.request(
      withOptions(readItems('items', { filter, aggregate: { count: '*' }, limit: 1 }), {
        next: { revalidate: 300, tags: [`retailer-items:${retailerId}`] },
      }),
    ),
  ]);

  const total = Number((meta as unknown as Array<{ count: string }>)[0]?.count ?? 0);
  return { items: rows as Item[], total, page, pageSize };
}

export async function getItemBySlug(tenantId: string, slug: string): Promise<Item | null> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('items', {
        filter: { tenant: { _eq: tenantId }, slug: { _eq: slug }, status: { _eq: 'published' } },
        fields: ITEM_FIELDS,
        limit: 1,
      }),
      { next: { revalidate: 60, tags: [`item:${tenantId}:${slug}`] } },
    ),
  );
  return (rows[0] as Item | undefined) ?? null;
}

export async function getItemAttributes(itemId: string): Promise<ItemAttribute[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    readItems('item_attributes', {
      filter: { item: { _eq: itemId } },
      fields: ['id', 'item', 'definition', 'value'],
      limit: -1,
    }),
  );
  return rows as ItemAttribute[];
}

export async function listTrendingItems(tenantId: string, limit = 8): Promise<Item[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('items', {
        filter: { tenant: { _eq: tenantId }, status: { _eq: 'published' } },
        fields: ITEM_FIELDS,
        sort: ['-hot_score'],
        limit,
      }),
      { next: { revalidate: 60, tags: [`items:${tenantId}`] } },
    ),
  );
  return rows as Item[];
}

export async function listNewestItems(tenantId: string, limit = 8): Promise<Item[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('items', {
        filter: { tenant: { _eq: tenantId }, status: { _eq: 'published' } },
        fields: ITEM_FIELDS,
        sort: ['-date_created'],
        limit,
      }),
      { next: { revalidate: 60, tags: [`items:${tenantId}`] } },
    ),
  );
  return rows as Item[];
}

export interface CreateItemInput {
  tenantId: string;
  categoryId: string;
  title: string;
  slug: string;
  url: string | null;
  body: string;
  brand: string | null;
  imageAssetId: string | null;
  authorUserId: string;
  attributes: Array<{ definitionId: string; value: AttributeValue }>;
}

/** Creates a member-submitted item, its attribute values, and any proposed shop links. Runs as the Service account, with ownership set explicitly. */
export async function createSubmittedItem(input: CreateItemInput): Promise<Item> {
  const client = getServiceDirectusClient();

  const item = (await client.request(
    createItem(
      'items',
      {
        tenant: input.tenantId,
        category: input.categoryId,
        title: input.title,
        slug: input.slug,
        url: input.url,
        body: input.body,
        brand: input.brand,
        image: input.imageAssetId,
        status: 'published',
        user_created: input.authorUserId,
      },
      { fields: ITEM_FIELDS },
    ),
  )) as Item;

  for (const attribute of input.attributes) {
    await client.request(
      createItem(
        'item_attributes',
        {
          item: item.id,
          definition: attribute.definitionId,
          value: jsonColumnValue(attribute.value) as AttributeValue,
        },
        { fields: ['id'] },
      ),
    );
  }

  return item;
}

/** Directus writes bare JS strings straight into `json` columns without re-serializing them, which Postgres rejects — see apps/directus/src/seed/upsert.ts for the same fix on the seeding side. */
function jsonColumnValue(value: AttributeValue): unknown {
  if (value === null || typeof value === 'object') return value;
  return JSON.stringify(value);
}

export async function getOffersForItem(itemId: string): Promise<ItemOffer[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('item_offers', {
        // The Public policy's item_offers permission field allow-list
        // (apps/directus/src/permissions/definitions.ts) deliberately
        // excludes raw url/affiliate_* fields — and doesn't include
        // `status` either, so filtering on it here would 403 even though
        // it's not in `fields`. Not needed anyway: the policy's own
        // row-level permission rule already restricts reads to
        // status=published server-side.
        filter: { item: { _eq: itemId } },
        fields: [
          'id',
          'tenant',
          'item',
          'title',
          'is_official',
          'is_sponsored',
          'price',
          'currency',
          'price_checked_at',
          'availability',
          'sort',
          { retailer: ['id', 'name', 'slug', 'logo', 'type', 'kind'] },
          { location: ['id', 'name', 'slug', 'city'] },
        ],
        sort: ['sort'],
        limit: -1,
      }),
      { next: { revalidate: 60, tags: [`offers:${itemId}`] } },
    ),
  );
  return rows as ItemOffer[];
}

export async function getItemById(itemId: string): Promise<Item | null> {
  const client = getServiceDirectusClient();
  try {
    const item = await client.request(readItem('items', itemId, { fields: ITEM_FIELDS }));
    return item as Item;
  } catch {
    return null;
  }
}
