import 'server-only';
import {
  createDirectus,
  rest,
  staticToken,
  type DirectusClient,
  type RestClient,
} from '@directus/sdk';
import type { BucketBoardSchema } from '@bucketboard/shared';
import { getServerEnv } from '../env';

export type DirectusRestClient = DirectusClient<BucketBoardSchema> & RestClient<BucketBoardSchema>;

let publicClient: DirectusRestClient | null = null;
let serviceClient: DirectusRestClient | null = null;

/**
 * Unauthenticated client (the Directus "Public" policy) — anonymous,
 * read-only, safe to use inside ISR/cached Server Component fetches.
 * Never holds credentials, so it can't leak anything if a response is
 * ever accidentally exposed.
 */
export function getPublicDirectusClient(): DirectusRestClient {
  if (publicClient) return publicClient;
  publicClient = createDirectus<BucketBoardSchema>(getServerEnv().DIRECTUS_URL).with(rest());
  return publicClient;
}

/**
 * Server-only client authenticated as the narrowly-scoped "Service" role
 * (see apps/directus/src/permissions/definitions.ts). Used by server
 * actions and route handlers for anything requiring auth, write access,
 * or fields the Public policy can't see. Never imported from a Client
 * Component — the `server-only` import above throws at build time if
 * that ever happens.
 */
export function getServiceDirectusClient(): DirectusRestClient {
  if (serviceClient) return serviceClient;
  serviceClient = createDirectus<BucketBoardSchema>(getServerEnv().DIRECTUS_URL)
    .with(rest())
    .with(staticToken(getServerEnv().DIRECTUS_SERVICE_TOKEN));
  return serviceClient;
}
