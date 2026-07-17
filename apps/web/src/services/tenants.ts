import 'server-only';
import { readItems } from '@directus/sdk';
import type { Tenant } from '@bucketboard/shared';
import { getPublicDirectusClient } from '../lib/directus/client';

const TENANT_FIELDS = [
  'id',
  'name',
  'slug',
  'domain',
  'status',
  'description',
  'logo',
  'og_image',
  'default_locale',
  'default_currency',
  'default_country',
  'settings',
] as const;

/** Resolves a tenant by its custom domain (production) — active tenants only. */
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    readItems('tenants', {
      filter: { domain: { _eq: domain }, status: { _eq: 'active' } },
      fields: TENANT_FIELDS,
      limit: 1,
    }),
  );
  return (rows[0] as Tenant | undefined) ?? null;
}

/** Resolves a tenant by its slug (the `/t/[slug]` dev fallback, and internal rewrites). */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    readItems('tenants', {
      filter: { slug: { _eq: slug }, status: { _eq: 'active' } },
      fields: TENANT_FIELDS,
      limit: 1,
    }),
  );
  return (rows[0] as Tenant | undefined) ?? null;
}
