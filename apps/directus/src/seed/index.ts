import { createUser, readUsers } from '@directus/sdk';
import { getAdminClient } from '../lib/client.js';
import { findOrCreate, toJsonColumnValue, updateById } from './upsert.js';
import { ensurePlaceholderImage } from './placeholders.js';
import { supermarketCategoryTree, countCategories, type CategoryTreeNode } from './categoryTree.js';
import { attributeDefinitionSeeds } from './attributes.js';
import { affiliateProgramSeeds, retailerTagSeeds, retailerSeeds } from './retailers.js';
import { itemSeeds } from './items.js';

const TENANT_SLUG = 'supermarket';

async function seedTenant(client: Awaited<ReturnType<typeof getAdminClient>>): Promise<string> {
  const id = await findOrCreate(
    client,
    'tenants',
    { slug: { _eq: TENANT_SLUG } },
    {
      name: 'BucketBoard Supermarket',
      slug: TENANT_SLUG,
      status: 'active',
      description:
        'Community-favourite UK supermarket products — where to buy them online and in independent local shops.',
      default_locale: 'en-GB',
      default_currency: 'GBP',
      default_country: 'GB',
      settings: { theme: { primaryColor: '#059669' } },
    },
  );
  console.log(`  tenant: ${TENANT_SLUG} (${id})`);
  return id;
}

/**
 * Creates the category tree top-down, computing `path`/`depth` inline as
 * each level is created (rather than relying on the async "Category Path
 * Sync" Flow) — this avoids a race where a child is created before its
 * just-created parent's Flow-computed path has landed.
 */
async function seedCategories(
  client: Awaited<ReturnType<typeof getAdminClient>>,
  tenantId: string,
): Promise<Map<string, string>> {
  const idBySlug = new Map<string, string>();

  async function walk(
    nodes: CategoryTreeNode[],
    parentId: string | null,
    parentPath: string | null,
    depth: number,
    sort: number,
  ) {
    for (const [index, node] of nodes.entries()) {
      const path = parentPath ? `${parentPath}/${node.slug}` : node.slug;
      const id = await findOrCreate(
        client,
        'categories',
        {
          tenant: { _eq: tenantId },
          slug: { _eq: node.slug },
          parent: parentId ? { _eq: parentId } : { _null: true },
        },
        {
          tenant: tenantId,
          parent: parentId,
          name: node.name,
          slug: node.slug,
          path,
          depth,
          icon: node.icon ?? null,
          description: node.description ?? null,
          sort: sort + index,
          status: 'published',
        },
      );
      idBySlug.set(node.slug, id);
      if (node.children) {
        await walk(node.children, id, path, depth + 1, 0);
      }
    }
  }

  await walk(supermarketCategoryTree, null, null, 0, 0);
  console.log(
    `  categories: ${idBySlug.size} (expected ${countCategories(supermarketCategoryTree)})`,
  );
  return idBySlug;
}

async function seedAttributeDefinitions(
  client: Awaited<ReturnType<typeof getAdminClient>>,
  tenantId: string,
  categoryIdBySlug: Map<string, string>,
): Promise<Map<string, string>> {
  const idByKey = new Map<string, string>();
  for (const def of attributeDefinitionSeeds) {
    const categoryId = def.categorySlug ? (categoryIdBySlug.get(def.categorySlug) ?? null) : null;
    const id = await findOrCreate(
      client,
      'attribute_definitions',
      { tenant: { _eq: tenantId }, key: { _eq: def.key } },
      {
        tenant: tenantId,
        category: categoryId,
        key: def.key,
        label: def.label,
        type: def.type,
        options: def.options ? def.options.map((o) => ({ label: o.label, value: o.value })) : null,
        unit: def.unit ?? null,
        required: def.required,
        filterable: def.filterable,
      },
    );
    idByKey.set(def.key, id);
  }
  console.log(`  attribute definitions: ${idByKey.size}`);
  return idByKey;
}

async function seedAffiliatePrograms(
  client: Awaited<ReturnType<typeof getAdminClient>>,
): Promise<Map<string, string>> {
  const idBySlug = new Map<string, string>();
  for (const program of affiliateProgramSeeds) {
    const id = await findOrCreate(
      client,
      'affiliate_programs',
      { slug: { _eq: program.slug } },
      {
        name: program.name,
        slug: program.slug,
        network: program.network,
        link_template: program.link_template,
        param_schema: program.param_schema,
        deeplink_supported: program.deeplink_supported,
        status: 'active',
        notes: program.notes,
      },
    );
    idBySlug.set(program.slug, id);
  }
  console.log(`  affiliate programs: ${idBySlug.size}`);
  return idBySlug;
}

async function seedRetailerTags(
  client: Awaited<ReturnType<typeof getAdminClient>>,
): Promise<Map<string, string>> {
  const idBySlug = new Map<string, string>();
  for (const tag of retailerTagSeeds) {
    const id = await findOrCreate(
      client,
      'tags',
      { slug: { _eq: tag.slug } },
      { tenant: null, name: tag.name, slug: tag.slug, context: tag.context },
    );
    idBySlug.set(tag.slug, id);
  }
  console.log(`  retailer tags: ${idBySlug.size}`);
  return idBySlug;
}

async function seedRetailers(
  client: Awaited<ReturnType<typeof getAdminClient>>,
  tenantId: string,
  affiliateProgramIdBySlug: Map<string, string>,
  tagIdBySlug: Map<string, string>,
): Promise<{ retailerIdBySlug: Map<string, string>; locationIdBySlug: Map<string, string> }> {
  const retailerIdBySlug = new Map<string, string>();
  const locationIdBySlug = new Map<string, string>();

  for (const retailer of retailerSeeds) {
    const logo = await ensurePlaceholderImage(client, retailer.name, { width: 400, height: 400 });
    const retailerId = await findOrCreate(
      client,
      'retailers',
      { slug: { _eq: retailer.slug } },
      {
        tenant: null,
        name: retailer.name,
        slug: retailer.slug,
        type: retailer.type,
        kind: retailer.kind,
        website: retailer.website ?? null,
        logo,
        description: retailer.description,
        country: retailer.country,
        currency: retailer.currency,
        domains: retailer.domains,
        default_affiliate_program: retailer.defaultAffiliateProgramSlug
          ? (affiliateProgramIdBySlug.get(retailer.defaultAffiliateProgramSlug) ?? null)
          : null,
        default_affiliate_params: retailer.default_affiliate_params ?? null,
        nofollow: true,
        status: 'published',
        sort: retailerSeeds.indexOf(retailer),
      },
    );
    retailerIdBySlug.set(retailer.slug, retailerId);

    for (const tagSlug of retailer.tags) {
      const tagId = tagIdBySlug.get(tagSlug);
      if (!tagId) continue;
      await findOrCreate(
        client,
        'retailer_tags',
        { retailer: { _eq: retailerId }, tag: { _eq: tagId } },
        { retailer: retailerId, tag: tagId },
      );
    }

    for (const location of retailer.locations ?? []) {
      const locationId = await findOrCreate(
        client,
        'retailer_locations',
        { retailer: { _eq: retailerId }, slug: { _eq: location.slug } },
        {
          retailer: retailerId,
          tenant: tenantId,
          name: location.name,
          slug: location.slug,
          address_line_1: location.address_line_1,
          city: location.city,
          postcode: location.postcode,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
          phone: location.phone ?? null,
          opening_hours: location.opening_hours ?? null,
          status: 'published',
        },
      );
      locationIdBySlug.set(`${retailer.slug}/${location.slug}`, locationId);
    }

    // Enable every retailer for the launch tenant, with a plausible per-tenant tracking id.
    await findOrCreate(
      client,
      'retailer_tenant_settings',
      { tenant: { _eq: tenantId }, retailer: { _eq: retailerId } },
      {
        tenant: tenantId,
        retailer: retailerId,
        enabled: true,
        affiliate_id: retailer.defaultAffiliateProgramSlug ? `bucketboard-${retailer.slug}` : null,
        commission_note: 'Seed data — replace with real affiliate credentials before going live.',
      },
    );
  }

  console.log(`  retailers: ${retailerIdBySlug.size}, locations: ${locationIdBySlug.size}`);
  return { retailerIdBySlug, locationIdBySlug };
}

async function seedItems(
  client: Awaited<ReturnType<typeof getAdminClient>>,
  tenantId: string,
  categoryIdBySlug: Map<string, string>,
  attributeIdByKey: Map<string, string>,
  retailerIdBySlug: Map<string, string>,
  locationIdBySlug: Map<string, string>,
): Promise<void> {
  let itemCount = 0;
  let offerCount = 0;

  for (const item of itemSeeds) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`  ! skipping "${item.title}": unknown category ${item.categorySlug}`);
      continue;
    }

    const image = await ensurePlaceholderImage(client, item.title, { width: 800, height: 600 });
    const itemId = await findOrCreate(
      client,
      'items',
      { tenant: { _eq: tenantId }, slug: { _eq: item.slug } },
      {
        tenant: tenantId,
        category: categoryId,
        title: item.title,
        slug: item.slug,
        url: item.url ?? null,
        image,
        body: item.body,
        brand: item.brand ?? null,
        status: 'published',
      },
    );
    itemCount += 1;

    for (const [key, value] of Object.entries(item.attributes ?? {})) {
      const definitionId = attributeIdByKey.get(key);
      if (!definitionId) continue;
      await findOrCreate(
        client,
        'item_attributes',
        { item: { _eq: itemId }, definition: { _eq: definitionId } },
        { item: itemId, definition: definitionId, value: toJsonColumnValue(value) },
      );
    }

    for (const [sort, offer] of item.offers.entries()) {
      const retailerId = retailerIdBySlug.get(offer.retailerSlug);
      if (!retailerId) {
        console.warn(`  ! skipping offer: unknown retailer ${offer.retailerSlug}`);
        continue;
      }
      const locationId = offer.locationSlug
        ? (locationIdBySlug.get(`${offer.retailerSlug}/${offer.locationSlug}`) ?? null)
        : null;

      await findOrCreate(
        client,
        'item_offers',
        {
          item: { _eq: itemId },
          retailer: { _eq: retailerId },
          external_id: offer.externalId ? { _eq: offer.externalId } : { _null: true },
        },
        {
          tenant: tenantId,
          item: itemId,
          retailer: retailerId,
          location: locationId,
          title: offer.title ?? null,
          url: offer.url,
          external_id: offer.externalId ?? null,
          is_official: offer.isOfficial ?? false,
          price: offer.price,
          currency: offer.currency,
          price_checked_at: new Date().toISOString(),
          availability: offer.availability ?? 'in_stock',
          status: 'published',
          verification_status: 'verified',
          sort,
        },
      );
      offerCount += 1;
    }

    // offer_count is normally Flow/enrichment-maintained; set directly since seed data bypasses that path.
    await updateById(client, 'items', itemId, { offer_count: item.offers.length });
  }

  console.log(`  items: ${itemCount}, offers: ${offerCount}`);
}

interface DemoMember {
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
}

const DEMO_MEMBERS: DemoMember[] = [
  { email: 'owner@bucketboard.dev', firstName: 'Olivia', lastName: 'Owner', role: 'owner' },
  { email: 'admin@bucketboard-demo.dev', firstName: 'Amir', lastName: 'Admin', role: 'admin' },
  { email: 'member@bucketboard.dev', firstName: 'Mia', lastName: 'Member', role: 'member' },
];

async function findOrCreateUser(
  client: Awaited<ReturnType<typeof getAdminClient>>,
  demo: DemoMember,
): Promise<string> {
  // directus_users is a core collection — the generic items API (and so
  // findOrCreate) refuses it; readUsers/createUser are the dedicated
  // equivalents. `fields` stays explicit (never `*`) to avoid Directus's
  // default field-selection error on our custom `memberships` alias field.
  const existing = await client.request(
    readUsers({ filter: { email: { _eq: demo.email } }, fields: ['id'], limit: 1 }),
  );
  if (existing[0]) return existing[0].id;

  const created = await client.request(
    createUser(
      { email: demo.email, first_name: demo.firstName, last_name: demo.lastName, status: 'active' },
      { fields: ['id'] },
    ),
  );
  return created.id;
}

async function seedMemberships(
  client: Awaited<ReturnType<typeof getAdminClient>>,
  tenantId: string,
): Promise<void> {
  for (const demo of DEMO_MEMBERS) {
    const userId = await findOrCreateUser(client, demo);
    await findOrCreate(
      client,
      'memberships',
      { tenant: { _eq: tenantId }, user: { _eq: userId } },
      {
        tenant: tenantId,
        user: userId,
        role: demo.role,
        status: 'active',
        display_name: `${demo.firstName} ${demo.lastName}`,
        karma: 0,
      },
    );
  }
  console.log(`  demo memberships: ${DEMO_MEMBERS.length}`);
}

async function main() {
  console.log(`Seeding "${TENANT_SLUG}" tenant...\n`);
  const client = await getAdminClient();

  const tenantId = await seedTenant(client);
  const categoryIdBySlug = await seedCategories(client, tenantId);
  const attributeIdByKey = await seedAttributeDefinitions(client, tenantId, categoryIdBySlug);
  const affiliateProgramIdBySlug = await seedAffiliatePrograms(client);
  const tagIdBySlug = await seedRetailerTags(client);
  const { retailerIdBySlug, locationIdBySlug } = await seedRetailers(
    client,
    tenantId,
    affiliateProgramIdBySlug,
    tagIdBySlug,
  );
  await seedItems(
    client,
    tenantId,
    categoryIdBySlug,
    attributeIdByKey,
    retailerIdBySlug,
    locationIdBySlug,
  );
  await seedMemberships(client, tenantId);

  console.log('\nSeed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
