import { readItems, updateItem } from '@directus/sdk';
import { recomputeCategoryPaths, type CategoryNode } from '@bucketboard/shared';
import { getAdminClient } from '../lib/client.js';

/**
 * Full-tenant category path/depth recompute, for reparents that move a
 * category with descendants — the one case the "Category Path Sync
 * (single node)" Flow can't safely handle (see its docstring in
 * src/flows/definitions.ts). Reuses the exact same, unit-tested algorithm
 * as that flow's single-node case (packages/shared's recomputeCategoryPaths).
 *
 * Usage: pnpm --filter=./apps/directus recompute-category-paths --tenant <slug>
 */
async function main() {
  const tenantSlugArgIndex = process.argv.indexOf('--tenant');
  const tenantSlug = tenantSlugArgIndex >= 0 ? process.argv[tenantSlugArgIndex + 1] : undefined;
  if (!tenantSlug) {
    console.error('Usage: recompute-category-paths --tenant <slug>');
    process.exitCode = 1;
    return;
  }

  const client = await getAdminClient();

  const tenants = await client.request(
    readItems('tenants', { filter: { slug: { _eq: tenantSlug } }, fields: ['id'], limit: 1 }),
  );
  const tenant = tenants[0];
  if (!tenant) {
    console.error(`No tenant found with slug "${tenantSlug}".`);
    process.exitCode = 1;
    return;
  }

  const categories = await client.request(
    readItems('categories', {
      filter: { tenant: { _eq: tenant.id } },
      fields: ['id', 'slug', 'parent', 'path', 'depth'],
      limit: -1,
    }),
  );

  const nodes: CategoryNode[] = categories.map((c) => ({
    id: c.id,
    parentId: typeof c.parent === 'string' ? c.parent : null,
    slug: c.slug,
  }));

  const recomputed = recomputeCategoryPaths(nodes);

  let changed = 0;
  for (const category of categories) {
    const next = recomputed.get(category.id);
    if (!next) continue;
    if (next.path === category.path && next.depth === category.depth) continue;

    await client.request(
      updateItem(
        'categories',
        category.id,
        { path: next.path, depth: next.depth },
        { fields: ['id'] },
      ),
    );
    console.log(`  ~ ${category.path} -> ${next.path} (depth ${next.depth})`);
    changed += 1;
  }

  console.log(
    `\nRecomputed ${categories.length} categories for tenant "${tenantSlug}", ${changed} changed.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
