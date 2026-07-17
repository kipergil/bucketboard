import 'server-only';
import { readItem, readItems, withOptions } from '@directus/sdk';
import type {
  AffiliateProgram,
  Retailer,
  RetailerLocation,
  RetailerTenantSettings,
} from '@bucketboard/shared';
import { getPublicDirectusClient, getServiceDirectusClient } from '../lib/directus/client';

const RETAILER_FIELDS = [
  'id',
  'tenant',
  'name',
  'slug',
  'type',
  'kind',
  'website',
  'logo',
  'cover',
  'description',
  'country',
  'currency',
  'domains',
  'nofollow',
  'status',
  'sort',
] as const;

export interface ListRetailersOptions {
  type?: string;
  kind?: string;
  tagSlug?: string;
  country?: string;
  page?: number;
  pageSize?: number;
}

export async function listRetailers(
  options: ListRetailersOptions = {},
): Promise<{ retailers: Retailer[]; total: number }> {
  const client = getPublicDirectusClient();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;

  const filter: Record<string, unknown> = { status: { _eq: 'published' } };
  if (options.type) filter.type = { _eq: options.type };
  if (options.kind) filter.kind = { _eq: options.kind };
  if (options.country) filter.country = { _eq: options.country };
  if (options.tagSlug) filter.tags = { tag: { slug: { _eq: options.tagSlug } } };

  const [rows, meta] = await Promise.all([
    client.request(
      withOptions(
        readItems('retailers', {
          filter,
          fields: RETAILER_FIELDS,
          sort: ['sort', 'name'],
          page,
          limit: pageSize,
        }),
        { next: { revalidate: 300, tags: ['retailers'] } },
      ),
    ),
    client.request(
      withOptions(readItems('retailers', { filter, aggregate: { count: '*' }, limit: 1 }), {
        next: { revalidate: 300, tags: ['retailers'] },
      }),
    ),
  ]);

  const total = Number((meta as unknown as Array<{ count: string }>)[0]?.count ?? 0);
  return { retailers: rows as Retailer[], total };
}

export async function getRetailerBySlug(slug: string): Promise<Retailer | null> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('retailers', {
        filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
        fields: RETAILER_FIELDS,
        limit: 1,
      }),
      { next: { revalidate: 300, tags: [`retailer:${slug}`] } },
    ),
  );
  return (rows[0] as Retailer | undefined) ?? null;
}

export async function listRetailerLocations(retailerId: string): Promise<RetailerLocation[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('retailer_locations', {
        filter: { retailer: { _eq: retailerId }, status: { _eq: 'published' } },
        sort: ['name'],
        limit: -1,
      }),
      { next: { revalidate: 300, tags: [`retailer-locations:${retailerId}`] } },
    ),
  );
  return rows as RetailerLocation[];
}

export async function getRetailerLocationBySlug(
  retailerId: string,
  locationSlug: string,
): Promise<RetailerLocation | null> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    readItems('retailer_locations', {
      filter: {
        retailer: { _eq: retailerId },
        slug: { _eq: locationSlug },
        status: { _eq: 'published' },
      },
      limit: 1,
    }),
  );
  return (rows[0] as RetailerLocation | undefined) ?? null;
}

/** Server-only: used by resolveOutboundUrl (via getServiceDirectusClient), never exposed to Public reads (may include commission notes). */
export async function getRetailerTenantSettings(
  tenantId: string,
  retailerId: string,
): Promise<RetailerTenantSettings | null> {
  const client = getServiceDirectusClient();
  const rows = await client.request(
    readItems('retailer_tenant_settings', {
      filter: { tenant: { _eq: tenantId }, retailer: { _eq: retailerId } },
      fields: [
        'id',
        'tenant',
        'retailer',
        'enabled',
        'affiliate_program',
        'affiliate_id',
        'affiliate_params',
      ],
      limit: 1,
    }),
  );
  return (rows[0] as RetailerTenantSettings | undefined) ?? null;
}

export async function getAffiliateProgramById(id: string): Promise<AffiliateProgram | null> {
  const client = getServiceDirectusClient();
  try {
    return (await client.request(readItem('affiliate_programs', id))) as AffiliateProgram;
  } catch {
    return null;
  }
}
