import { createItem, readItems, updateItem } from '@directus/sdk';
import type { AdminClient } from '../lib/client.js';
import type { BucketBoardSchema } from '@bucketboard/shared';

/**
 * Idempotent "find by a unique filter, else create" for seed scripts.
 * Returns the row's id either way. Intentionally simple (no update-if-
 * changed diffing) — seed data is meant to be created once and then
 * edited by hand in the panel, not continuously reconciled.
 */
export async function findOrCreate<Collection extends keyof BucketBoardSchema & string>(
  client: AdminClient,
  collection: Collection,
  filter: Record<string, unknown>,
  payload: Record<string, unknown>,
): Promise<string> {
  const existing = await client.request(
    readItems(collection, { filter, fields: ['id'], limit: 1 } as never),
  );
  const row = (existing as Array<{ id: string }>)[0];
  if (row) return row.id;

  const created = await client.request(
    createItem(collection, payload as never, { fields: ['id'] } as never),
  );
  return (created as { id: string }).id;
}

/**
 * Directus's generic items API writes bare JS values straight into
 * Postgres `json` columns without re-serializing them — objects and
 * arrays happen to already be valid JSON text, but a raw string like
 * `6x25g` is not (`insert ... - invalid input syntax for type json`).
 * Only string/number/boolean scalars need explicit JSON.stringify;
 * objects/arrays/null pass through unchanged. (Verified live: booleans
 * and numbers insert fine as-is — only bare strings break — but
 * stringifying all scalars is the same on the read side either way and
 * cheaper than special-casing just strings.)
 */
export function toJsonColumnValue(value: unknown): unknown {
  if (value === null || typeof value === 'object') return value;
  return JSON.stringify(value);
}

export async function updateById<Collection extends keyof BucketBoardSchema & string>(
  client: AdminClient,
  collection: Collection,
  id: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await client.request(updateItem(collection, id, payload as never, { fields: ['id'] } as never));
}
