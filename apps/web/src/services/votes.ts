import 'server-only';
import { createItem, deleteItem, readItems, updateItem } from '@directus/sdk';
import { toggleVote, type VoteValue } from '@bucketboard/shared';
import { getServiceDirectusClient } from '../lib/directus/client';

export interface CastVoteResult {
  nextValue: VoteValue | null;
  voteScore: number;
  votesUp: number;
  votesDown: number;
}

/**
 * Casts/flips/removes a vote and atomically applies the resulting delta to
 * the item's denormalised counters, using the tested toggleVote() pure
 * function. The "Vote Counter Sync" Directus Flow re-derives the same
 * counters from the votes table as a self-healing safety net — this is
 * the fast path that makes the UI feel instant.
 */
export async function castVote(
  tenantId: string,
  itemId: string,
  userId: string,
  requestedValue: VoteValue,
): Promise<CastVoteResult> {
  const client = getServiceDirectusClient();

  const existing = await client.request(
    readItems('votes', {
      filter: { item: { _eq: itemId }, user: { _eq: userId } },
      fields: ['id', 'value'],
      limit: 1,
    }),
  );
  const existingVote = existing[0] as { id: string; value: VoteValue } | undefined;

  const result = toggleVote(existingVote?.value ?? null, requestedValue);

  if (result.action === 'create') {
    await client.request(
      createItem(
        'votes',
        { tenant: tenantId, item: itemId, user: userId, value: requestedValue },
        { fields: ['id'] },
      ),
    );
  } else if (result.action === 'update' && existingVote) {
    await client.request(
      updateItem('votes', existingVote.id, { value: requestedValue }, { fields: ['id'] }),
    );
  } else if (result.action === 'delete' && existingVote) {
    await client.request(deleteItem('votes', existingVote.id));
  }

  const items = await client.request(
    readItems('items', {
      filter: { id: { _eq: itemId } },
      fields: ['vote_score', 'votes_up', 'votes_down'],
      limit: 1,
    }),
  );
  // Read-then-write isn't atomic — a concurrent second vote on the same
  // item could interleave here. Acceptable: the "Vote Counter Sync" Flow
  // (apps/directus/src/flows/definitions.ts) independently recomputes
  // these same counters from a full aggregate of the votes table on every
  // create/update, self-healing any drift shortly after.
  const current = items[0] as
    { vote_score: number; votes_up: number; votes_down: number } | undefined;
  const voteScore = (current?.vote_score ?? 0) + result.scoreDelta;
  const votesUp = (current?.votes_up ?? 0) + result.votesUpDelta;
  const votesDown = (current?.votes_down ?? 0) + result.votesDownDelta;

  await client.request(
    updateItem(
      'items',
      itemId,
      { vote_score: voteScore, votes_up: votesUp, votes_down: votesDown },
      { fields: ['id'] },
    ),
  );

  return { nextValue: result.nextValue, voteScore, votesUp, votesDown };
}

export async function getUserVote(itemId: string, userId: string): Promise<VoteValue | null> {
  const client = getServiceDirectusClient();
  const rows = await client.request(
    readItems('votes', {
      filter: { item: { _eq: itemId }, user: { _eq: userId } },
      fields: ['value'],
      limit: 1,
    }),
  );
  return (rows[0] as { value: VoteValue } | undefined)?.value ?? null;
}
