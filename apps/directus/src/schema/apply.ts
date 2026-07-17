import {
  createCollection,
  createField,
  createRelation,
  readCollections,
  readFieldsByCollection,
  readRelation,
} from '@directus/sdk';
import { getSchemaClient } from '../lib/client.js';
import { allCollections } from './definitions/index.js';
import { applyConstraints } from './constraints.js';
import type { CollectionDefinition, FieldDefinition } from './types.js';

/**
 * The SDK's generated `DirectusField.schema` type forbids `null`, but the
 * Directus REST API requires an explicit `schema: null` to create an alias
 * field (o2m/m2m/presentation — no DB column). This cast targets the
 * library's own declared parameter type, not `unknown`/`any` — it exists
 * because the .d.ts is stricter than the real API contract.
 */
type CreateFieldInput = Parameters<typeof createField>[1];

function toDirectusField(def: FieldDefinition): CreateFieldInput {
  return {
    field: def.field,
    type: def.type,
    meta: def.meta ?? {},
    schema: def.schema === null ? null : (def.schema ?? {}),
  } as CreateFieldInput;
}

async function ensureCollection(
  client: Awaited<ReturnType<typeof getSchemaClient>>,
  existing: Set<string>,
  def: CollectionDefinition,
) {
  if (existing.has(def.collection)) {
    console.log(`  = collection ${def.collection} already exists`);
    return;
  }

  await client.request(
    createCollection({
      collection: def.collection,
      meta: {
        icon: def.icon,
        note: def.note,
        singleton: def.singleton ?? false,
        display_template: def.displayTemplate ?? null,
        sort_field: def.sortField ?? null,
        archive_field: def.archiveField ?? null,
        archive_value: def.archiveValue ?? null,
        unarchive_value: def.unarchiveValue ?? null,
      },
      schema: {},
      fields: def.fields.map(toDirectusField),
    }),
  );
  console.log(`  + created collection ${def.collection}`);
}

async function ensureBaseFields(
  client: Awaited<ReturnType<typeof getSchemaClient>>,
  def: CollectionDefinition,
) {
  const currentFields = await client.request(readFieldsByCollection(def.collection));
  const currentNames = new Set(currentFields.map((f) => f.field));

  for (const field of def.fields) {
    if (currentNames.has(field.field)) continue;
    await client.request(createField(def.collection, toDirectusField(field)));
    console.log(`  + field ${def.collection}.${field.field}`);
  }
}

async function relationExists(
  client: Awaited<ReturnType<typeof getSchemaClient>>,
  collection: string,
  field: string,
): Promise<boolean> {
  try {
    await client.request(readRelation(collection, field));
    return true;
  } catch {
    return false;
  }
}

async function ensureRelationFields(
  client: Awaited<ReturnType<typeof getSchemaClient>>,
  def: CollectionDefinition,
) {
  const currentFields = await client.request(readFieldsByCollection(def.collection));
  const currentNames = new Set(currentFields.map((f) => f.field));

  for (const { field, relation } of def.relationFields) {
    if (!currentNames.has(field.field)) {
      await client.request(createField(def.collection, toDirectusField(field)));
      console.log(`  + relation field ${def.collection}.${field.field}`);
    }

    if (relation.oneField) {
      const relatedFields = await client.request(
        readFieldsByCollection(relation.related_collection),
      );
      const relatedNames = new Set(relatedFields.map((f) => f.field));
      if (!relatedNames.has(relation.oneField)) {
        await client.request(
          createField(
            relation.related_collection,
            toDirectusField({
              field: relation.oneField,
              type: 'alias',
              meta: {
                special: ['o2m'],
                interface: 'list-o2m',
                options: { enableSelect: false },
              },
              schema: null,
            }),
          ),
        );
        console.log(`  + o2m alias ${relation.related_collection}.${relation.oneField}`);
      }
    }

    if (await relationExists(client, relation.collection, relation.field)) {
      console.log(`  = relation ${relation.collection}.${relation.field} already exists`);
      continue;
    }

    await client.request(
      createRelation({
        collection: relation.collection,
        field: relation.field,
        related_collection: relation.related_collection,
        meta: {
          one_field: relation.oneField ?? null,
          one_deselect_action: relation.onDelete === 'CASCADE' ? 'delete' : 'nullify',
        },
      }),
    );
    console.log(
      `  + relation ${relation.collection}.${relation.field} -> ${relation.related_collection}`,
    );
  }
}

async function main() {
  console.log(
    `Applying BucketBoard schema to ${process.env.DIRECTUS_URL ?? 'http://localhost:8055'}...`,
  );
  const client = await getSchemaClient();

  const existingCollections = new Set(
    (await client.request(readCollections())).map((c) => c.collection),
  );

  console.log('\nPass 1/3 — collections + base fields');
  for (const def of allCollections) {
    await ensureCollection(client, existingCollections, def);
    if (existingCollections.has(def.collection)) {
      await ensureBaseFields(client, def);
    }
  }

  console.log('\nPass 2/3 — relation fields + relations');
  for (const def of allCollections) {
    await ensureRelationFields(client, def);
  }

  console.log('\nPass 3/3 — composite unique constraints (raw SQL)');
  await applyConstraints();

  console.log('\nSchema apply complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    // The SDK's fetch client can leave a keep-alive handle open; force exit
    // rather than leaving `pnpm schema:apply` hanging after success.
    process.exit(process.exitCode ?? 0);
  });
