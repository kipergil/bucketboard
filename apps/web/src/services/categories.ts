import 'server-only';
import { readItems, withOptions } from '@directus/sdk';
import type { AttributeDefinition, Category } from '@bucketboard/shared';
import { getPublicDirectusClient } from '../lib/directus/client';

const CATEGORY_FIELDS = [
  'id',
  'tenant',
  'parent',
  'name',
  'slug',
  'path',
  'depth',
  'description',
  'icon',
  'cover',
  'sort',
  'status',
] as const;

/** The full published category tree for a tenant, sorted for easy in-memory tree building. */
export async function getCategoryTree(tenantId: string): Promise<Category[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('categories', {
        filter: { tenant: { _eq: tenantId }, status: { _eq: 'published' } },
        fields: CATEGORY_FIELDS,
        sort: ['depth', 'sort', 'name'],
        limit: -1,
      }),
      { next: { revalidate: 300, tags: [`categories:${tenantId}`] } },
    ),
  );
  return rows as Category[];
}

export async function getCategoryByPath(tenantId: string, path: string): Promise<Category | null> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('categories', {
        filter: { tenant: { _eq: tenantId }, path: { _eq: path }, status: { _eq: 'published' } },
        fields: CATEGORY_FIELDS,
        limit: 1,
      }),
      { next: { revalidate: 300, tags: [`categories:${tenantId}`] } },
    ),
  );
  return (rows[0] as Category | undefined) ?? null;
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    readItems('categories', {
      filter: { id: { _eq: categoryId } },
      fields: CATEGORY_FIELDS,
      limit: 1,
    }),
  );
  return (rows[0] as Category | undefined) ?? null;
}

/** Attribute definitions applicable to a category: tenant-wide (category null) + this category's own. */
export async function getAttributeDefinitionsForCategory(
  tenantId: string,
  categoryId: string,
): Promise<AttributeDefinition[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('attribute_definitions', {
        filter: {
          tenant: { _eq: tenantId },
          _or: [{ category: { _null: true } }, { category: { _eq: categoryId } }],
        },
        sort: ['sort'],
        limit: -1,
      }),
      { next: { revalidate: 300, tags: [`attribute-definitions:${tenantId}`] } },
    ),
  );
  return rows as AttributeDefinition[];
}

export async function getAllAttributeDefinitions(tenantId: string): Promise<AttributeDefinition[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    withOptions(
      readItems('attribute_definitions', {
        filter: { tenant: { _eq: tenantId } },
        sort: ['sort'],
        limit: -1,
      }),
      { next: { revalidate: 300, tags: [`attribute-definitions:${tenantId}`] } },
    ),
  );
  return rows as AttributeDefinition[];
}
