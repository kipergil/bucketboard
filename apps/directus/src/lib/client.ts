import {
  authentication,
  createDirectus,
  rest,
  type DirectusClient,
  type RestClient,
} from '@directus/sdk';
import type { BucketBoardSchema } from '@bucketboard/shared';
import { env } from './env.js';

export type AdminClient = DirectusClient<BucketBoardSchema> & RestClient<BucketBoardSchema>;

/**
 * A loosely-typed variant used only by the schema/permissions/flows meta
 * scripts, which operate on Directus's own system collections
 * (directus_collections, directus_fields, directus_relations, ...) with
 * collection names that don't yet exist in — and are precisely what's
 * building — BucketBoardSchema. Application code must never use this;
 * use `getAdminClient` (or the web app's tenant-scoped service layer).
 */
export type SchemaClient = DirectusClient<Record<string, unknown[]>> &
  RestClient<Record<string, unknown[]>>;

let cachedAdminClient: AdminClient | null = null;
let cachedSchemaClient: SchemaClient | null = null;

async function login<T extends { login: (email: string, password: string) => Promise<unknown> }>(
  client: T,
): Promise<T> {
  await client.login(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  return client;
}

/** Admin-authenticated, fully-typed client for seeding/cloning real BucketBoard data. */
export async function getAdminClient(): Promise<AdminClient> {
  if (cachedAdminClient) return cachedAdminClient;
  const client = createDirectus<BucketBoardSchema>(env.DIRECTUS_URL)
    .with(authentication('json'))
    .with(rest());
  cachedAdminClient = await login(client);
  return cachedAdminClient;
}

/** Admin-authenticated client for schema/permissions/flows bootstrapping scripts. */
export async function getSchemaClient(): Promise<SchemaClient> {
  if (cachedSchemaClient) return cachedSchemaClient;
  const client = createDirectus<Record<string, unknown[]>>(env.DIRECTUS_URL)
    .with(authentication('json'))
    .with(rest());
  cachedSchemaClient = await login(client);
  return cachedSchemaClient;
}
