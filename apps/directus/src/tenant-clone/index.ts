import { readItems } from '@directus/sdk';
import { getAdminClient } from '../lib/client.js';
import { findOrCreate } from '../seed/upsert.js';

interface Args {
  from: string;
  to: string;
  name?: string;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const from = get('--from');
  const to = get('--to');
  if (!from || !to) {
    console.error(
      'Usage: tenant:clone --from <source-slug> --to <new-slug> [--name "Display Name"]',
    );
    process.exit(1);
  }
  return { from, to, name: get('--name') };
}

/**
 * Clones the category tree, attribute definitions, and retailer
 * enablement (not credentials, not items) from one tenant to a new one —
 * the "zero-schema-change vertical launch" path described in the spec.
 * Affiliate credentials are deliberately NOT copied: `enabled` carries
 * over, but `affiliate_id`/`affiliate_params` are left blank since
 * they're specific to the source tenant's own affiliate accounts.
 */
async function main() {
  const { from, to, name } = parseArgs();
  const client = await getAdminClient();

  const sourceTenants = await client.request(
    readItems('tenants', { filter: { slug: { _eq: from } }, fields: ['id'], limit: 1 }),
  );
  const sourceTenantId = sourceTenants[0]?.id;
  if (!sourceTenantId) {
    console.error(`Source tenant "${from}" not found.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Cloning "${from}" -> "${to}"...\n`);

  const targetTenantId = await findOrCreate(
    client,
    'tenants',
    { slug: { _eq: to } },
    {
      name: name ?? `${to[0]?.toUpperCase()}${to.slice(1)}`,
      slug: to,
      status: 'draft',
      default_locale: 'en-GB',
      default_currency: 'GBP',
      default_country: 'GB',
      settings: {},
    },
  );
  console.log(`  tenant: ${to} (${targetTenantId})`);

  // Categories — read the whole source tree, walk parent-first (it's
  // already sorted by depth from the query) so a child's mapped parent id
  // always exists before it's needed.
  const sourceCategories = await client.request(
    readItems('categories', {
      filter: { tenant: { _eq: sourceTenantId } },
      fields: [
        'id',
        'parent',
        'name',
        'slug',
        'path',
        'depth',
        'icon',
        'description',
        'sort',
        'status',
      ],
      sort: ['depth'],
      limit: -1,
    }),
  );

  const categoryIdMap = new Map<string, string>();
  for (const category of sourceCategories) {
    const parentOldId = typeof category.parent === 'string' ? category.parent : null;
    const parentNewId = parentOldId ? (categoryIdMap.get(parentOldId) ?? null) : null;

    const newId = await findOrCreate(
      client,
      'categories',
      {
        tenant: { _eq: targetTenantId },
        slug: { _eq: category.slug },
        parent: parentNewId ? { _eq: parentNewId } : { _null: true },
      },
      {
        tenant: targetTenantId,
        parent: parentNewId,
        name: category.name,
        slug: category.slug,
        path: category.path,
        depth: category.depth,
        icon: category.icon,
        description: category.description,
        sort: category.sort,
        status: category.status,
      },
    );
    categoryIdMap.set(category.id, newId);
  }
  console.log(`  categories: ${categoryIdMap.size}`);

  // Attribute definitions
  const sourceAttributeDefinitions = await client.request(
    readItems('attribute_definitions', {
      filter: { tenant: { _eq: sourceTenantId } },
      fields: [
        'id',
        'category',
        'key',
        'label',
        'type',
        'options',
        'unit',
        'required',
        'filterable',
        'sort',
      ],
      limit: -1,
    }),
  );
  let attributeCount = 0;
  for (const def of sourceAttributeDefinitions) {
    const categoryOldId = typeof def.category === 'string' ? def.category : null;
    const categoryNewId = categoryOldId ? (categoryIdMap.get(categoryOldId) ?? null) : null;

    await findOrCreate(
      client,
      'attribute_definitions',
      { tenant: { _eq: targetTenantId }, key: { _eq: def.key } },
      {
        tenant: targetTenantId,
        category: categoryNewId,
        key: def.key,
        label: def.label,
        type: def.type,
        options: def.options,
        unit: def.unit,
        required: def.required,
        filterable: def.filterable,
        sort: def.sort,
      },
    );
    attributeCount += 1;
  }
  console.log(`  attribute definitions: ${attributeCount}`);

  // Retailer enablement (not credentials)
  const sourceRetailerSettings = await client.request(
    readItems('retailer_tenant_settings', {
      filter: { tenant: { _eq: sourceTenantId } },
      fields: ['retailer', 'enabled'],
      limit: -1,
    }),
  );
  let retailerSettingsCount = 0;
  for (const setting of sourceRetailerSettings) {
    const retailerId =
      typeof setting.retailer === 'string' ? setting.retailer : setting.retailer?.id;
    if (!retailerId) continue;

    await findOrCreate(
      client,
      'retailer_tenant_settings',
      { tenant: { _eq: targetTenantId }, retailer: { _eq: retailerId } },
      {
        tenant: targetTenantId,
        retailer: retailerId,
        enabled: setting.enabled,
        commission_note:
          'Cloned from another tenant — set affiliate credentials before going live.',
      },
    );
    retailerSettingsCount += 1;
  }
  console.log(`  retailer enablement: ${retailerSettingsCount}`);

  console.log(`\nDone. Items were NOT cloned — "${to}" starts with an empty catalogue.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
