import 'server-only';
import { readItems } from '@directus/sdk';
import type { Item, Membership } from '@bucketboard/shared';
import { getPublicDirectusClient, getServiceDirectusClient } from '../lib/directus/client';

export interface PublicProfile {
  membership: Membership;
  items: Item[];
}

/**
 * Looks up a member by their tenant-scoped display name (the closest thing
 * we have to a "username" — Directus's core user model has no username
 * field). Case-insensitive exact match.
 */
export async function getPublicProfileByDisplayName(
  tenantId: string,
  displayName: string,
): Promise<PublicProfile | null> {
  // memberships isn't in the Public policy's read set (it can carry
  // moderator/admin role info an anonymous visitor shouldn't enumerate),
  // so this one lookup goes through the Service client — only the
  // display_name/role/karma fields we explicitly select ever reach the page.
  const membershipClient = getServiceDirectusClient();

  const memberships = await membershipClient.request(
    readItems('memberships', {
      filter: {
        tenant: { _eq: tenantId },
        display_name: { _icontains: displayName },
        status: { _eq: 'active' },
      },
      fields: ['id', 'tenant', 'user', 'role', 'status', 'display_name', 'karma'],
      limit: 1,
    }),
  );
  const membership = memberships[0] as Membership | undefined;
  if (!membership || membership.display_name?.toLowerCase() !== displayName.toLowerCase())
    return null;

  const userId = typeof membership.user === 'string' ? membership.user : membership.user.id;
  const publicClient = getPublicDirectusClient();
  const items = await publicClient.request(
    readItems('items', {
      filter: {
        tenant: { _eq: tenantId },
        user_created: { _eq: userId },
        status: { _eq: 'published' },
      },
      fields: [
        'id',
        'tenant',
        'category',
        'title',
        'slug',
        'url',
        'image',
        'body',
        'brand',
        'status',
        'vote_score',
        'votes_up',
        'votes_down',
        'comment_count',
        'offer_count',
        'hot_score',
      ],
      sort: ['-date_created'],
      limit: 24,
    }),
  );

  return { membership, items: items as Item[] };
}
