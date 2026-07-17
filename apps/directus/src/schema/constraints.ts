import 'dotenv/config';
import { Client } from 'pg';

/**
 * Composite unique constraints Directus's schema API can't express (it only
 * supports single-column `is_unique`). Applied as raw SQL against the same
 * Postgres instance, guarded with `IF NOT EXISTS` so re-running is a no-op.
 *
 * Two entries use a plain composite unique index plus a partial index for
 * the "shared/global" NULL case — SQL treats NULL as distinct from NULL, so
 * a plain `UNIQUE (tenant, slug)` would silently allow duplicate slugs among
 * rows where `tenant IS NULL` (global tags) or `parent IS NULL` (top-level
 * categories). The partial index closes that gap.
 */
const statements: string[] = [
  // memberships: one membership per (tenant, user)
  `CREATE UNIQUE INDEX IF NOT EXISTS memberships_tenant_user_uidx ON memberships (tenant, "user")`,

  // categories: slug unique within (tenant, parent), including top-level (parent IS NULL)
  `CREATE UNIQUE INDEX IF NOT EXISTS categories_tenant_parent_slug_uidx ON categories (tenant, parent, slug) WHERE parent IS NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS categories_tenant_slug_top_level_uidx ON categories (tenant, slug) WHERE parent IS NULL`,
  // categories: path unique within tenant
  `CREATE UNIQUE INDEX IF NOT EXISTS categories_tenant_path_uidx ON categories (tenant, path)`,

  // tags: slug unique within tenant, including global (tenant IS NULL)
  `CREATE UNIQUE INDEX IF NOT EXISTS tags_tenant_slug_uidx ON tags (tenant, slug) WHERE tenant IS NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS tags_global_slug_uidx ON tags (slug) WHERE tenant IS NULL`,

  // junctions
  `CREATE UNIQUE INDEX IF NOT EXISTS item_tags_item_tag_uidx ON item_tags (item, tag)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS retailer_tags_retailer_tag_uidx ON retailer_tags (retailer, tag)`,

  // items: slug unique within tenant
  `CREATE UNIQUE INDEX IF NOT EXISTS items_tenant_slug_uidx ON items (tenant, slug)`,

  // item_attributes: one value per (item, definition)
  `CREATE UNIQUE INDEX IF NOT EXISTS item_attributes_item_definition_uidx ON item_attributes (item, definition)`,

  // votes: one vote per (item, user)
  `CREATE UNIQUE INDEX IF NOT EXISTS votes_item_user_uidx ON votes (item, "user")`,

  // retailer_tenant_settings: one row per (tenant, retailer)
  `CREATE UNIQUE INDEX IF NOT EXISTS retailer_tenant_settings_tenant_retailer_uidx ON retailer_tenant_settings (tenant, retailer)`,

  // item_offers: prevents duplicate listings once external_id is known
  `CREATE UNIQUE INDEX IF NOT EXISTS item_offers_item_retailer_external_id_uidx ON item_offers (item, retailer, external_id)`,

  // retailer_locations: slug unique per retailer
  `CREATE UNIQUE INDEX IF NOT EXISTS retailer_locations_retailer_slug_uidx ON retailer_locations (retailer, slug)`,
];

export async function applyConstraints(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://directus:directus@localhost:5432/directus';
  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const statement of statements) {
      await client.query(statement);
      console.log(`  = ${statement.match(/INDEX IF NOT EXISTS (\S+)/)?.[1]}`);
    }
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  applyConstraints()
    .then(() => console.log('Constraints applied.'))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
