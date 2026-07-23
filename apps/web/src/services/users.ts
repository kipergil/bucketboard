import 'server-only';
import { createItem, createUser, readItems, readUsers, updateUser } from '@directus/sdk';
import type { AuthProvider, DirectusUser, Membership, MembershipRole } from '@bucketboard/shared';
import { getServiceDirectusClient } from '../lib/directus/client';

const USER_FIELDS = [
  'id',
  'email',
  'first_name',
  'last_name',
  'avatar',
  'status',
  'external_identifier',
  'auth_provider',
  'avatar_url',
] as const;

export interface ClerkUserSyncInput {
  clerkUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
}

/**
 * Upserts a directus_users row for a Clerk identity. Looked up by
 * `external_identifier` (the Clerk user id) first — falling back to email
 * so a user who signed up with a password and later returns via Google
 * gets linked to their existing row rather than duplicated (Clerk's own
 * identity linking keeps `email` stable across providers for the same
 * person).
 */
export async function upsertDirectusUserFromClerk(
  input: ClerkUserSyncInput,
): Promise<DirectusUser> {
  const client = getServiceDirectusClient();

  const byExternalId = await client.request(
    readUsers({
      filter: { external_identifier: { _eq: input.clerkUserId } },
      fields: USER_FIELDS,
      limit: 1,
    }),
  );
  const existing =
    (byExternalId[0] as DirectusUser | undefined) ??
    (input.email
      ? ((
          await client.request(
            readUsers({
              filter: { email: { _eq: input.email } },
              fields: USER_FIELDS,
              limit: 1,
            }),
          )
        )[0] as DirectusUser | undefined)
      : undefined);

  const payload = {
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    avatar_url: input.avatarUrl,
    external_identifier: input.clerkUserId,
    auth_provider: input.provider,
    status: 'active' as const,
  };

  if (existing) {
    await client.request(updateUser(existing.id, payload, { fields: ['id'] }));
    return { ...existing, ...payload };
  }

  const created = await client.request(createUser(payload, { fields: USER_FIELDS }));
  return created as unknown as DirectusUser;
}

export async function getDirectusUserByClerkId(clerkUserId: string): Promise<DirectusUser | null> {
  const client = getServiceDirectusClient();
  const rows = await client.request(
    readUsers({
      filter: { external_identifier: { _eq: clerkUserId } },
      fields: USER_FIELDS,
      limit: 1,
    }),
  );
  return (rows[0] as DirectusUser | undefined) ?? null;
}

export async function getMembership(tenantId: string, userId: string): Promise<Membership | null> {
  const client = getServiceDirectusClient();
  const rows = await client.request(
    readItems('memberships', {
      filter: { tenant: { _eq: tenantId }, user: { _eq: userId } },
      fields: ['id', 'tenant', 'user', 'role', 'status', 'display_name', 'karma'],
      limit: 1,
    }),
  );
  return (rows[0] as Membership | undefined) ?? null;
}

/** Auto-joins a user to a tenant as a plain `member` on their first authenticated action there. */
export async function ensureMembership(
  tenantId: string,
  userId: string,
  displayName: string | null,
): Promise<Membership> {
  const existing = await getMembership(tenantId, userId);
  if (existing) return existing;

  const client = getServiceDirectusClient();
  const created = await client.request(
    createItem(
      'memberships',
      {
        tenant: tenantId,
        user: userId,
        role: 'member' as MembershipRole,
        status: 'active',
        display_name: displayName,
      },
      { fields: ['id', 'tenant', 'user', 'role', 'status', 'display_name', 'karma'] },
    ),
  );
  return created as unknown as Membership;
}
