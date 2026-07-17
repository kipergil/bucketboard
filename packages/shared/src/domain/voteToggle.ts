import type { VoteValue } from '../enums';

export type VoteToggleAction = 'create' | 'update' | 'delete';

export interface VoteToggleResult {
  /** The vote row's value after this action, or null if the row was deleted. */
  nextValue: VoteValue | null;
  action: VoteToggleAction;
  /** Delta to apply to items.vote_score. Always equals votesUpDelta - votesDownDelta. */
  scoreDelta: number;
  votesUpDelta: number;
  votesDownDelta: number;
}

/**
 * Pure vote-toggle transition. Re-casting the same value removes the vote;
 * casting the opposite value flips it; casting with no prior vote creates one.
 * Returns the resulting row state plus the counter deltas a caller applies
 * to `items` (mirrors what the Directus Flow does server-side).
 */
export function toggleVote(
  currentValue: VoteValue | null,
  requestedValue: VoteValue,
): VoteToggleResult {
  if (currentValue === null) {
    return {
      nextValue: requestedValue,
      action: 'create',
      scoreDelta: requestedValue,
      votesUpDelta: requestedValue === 1 ? 1 : 0,
      votesDownDelta: requestedValue === -1 ? 1 : 0,
    };
  }

  if (currentValue === requestedValue) {
    return {
      nextValue: null,
      action: 'delete',
      scoreDelta: -currentValue,
      votesUpDelta: currentValue === 1 ? -1 : 0,
      votesDownDelta: currentValue === -1 ? -1 : 0,
    };
  }

  return {
    nextValue: requestedValue,
    action: 'update',
    scoreDelta: requestedValue - currentValue,
    votesUpDelta: requestedValue === 1 ? 1 : -1,
    votesDownDelta: requestedValue === -1 ? 1 : -1,
  };
}
