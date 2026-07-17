import { describe, expect, it } from 'vitest';
import type { VoteValue } from '../../enums.js';
import { toggleVote } from '../voteToggle.js';

describe('toggleVote', () => {
  it('creates an upvote when there is no prior vote', () => {
    const result = toggleVote(null, 1);
    expect(result).toEqual({
      nextValue: 1,
      action: 'create',
      scoreDelta: 1,
      votesUpDelta: 1,
      votesDownDelta: 0,
    });
  });

  it('creates a downvote when there is no prior vote', () => {
    const result = toggleVote(null, -1);
    expect(result).toEqual({
      nextValue: -1,
      action: 'create',
      scoreDelta: -1,
      votesUpDelta: 0,
      votesDownDelta: 1,
    });
  });

  it('removes the vote when re-casting the same upvote', () => {
    const result = toggleVote(1, 1);
    expect(result).toEqual({
      nextValue: null,
      action: 'delete',
      scoreDelta: -1,
      votesUpDelta: -1,
      votesDownDelta: 0,
    });
  });

  it('removes the vote when re-casting the same downvote', () => {
    const result = toggleVote(-1, -1);
    expect(result).toEqual({
      nextValue: null,
      action: 'delete',
      scoreDelta: 1,
      votesUpDelta: 0,
      votesDownDelta: -1,
    });
  });

  it('flips an upvote to a downvote', () => {
    const result = toggleVote(1, -1);
    expect(result).toEqual({
      nextValue: -1,
      action: 'update',
      scoreDelta: -2,
      votesUpDelta: -1,
      votesDownDelta: 1,
    });
  });

  it('flips a downvote to an upvote', () => {
    const result = toggleVote(-1, 1);
    expect(result).toEqual({
      nextValue: 1,
      action: 'update',
      scoreDelta: 2,
      votesUpDelta: 1,
      votesDownDelta: -1,
    });
  });

  it('always keeps scoreDelta equal to votesUpDelta - votesDownDelta', () => {
    const currentValues: Array<VoteValue | null> = [null, 1, -1];
    const requestedValues: VoteValue[] = [1, -1];
    for (const current of currentValues) {
      for (const requested of requestedValues) {
        const result = toggleVote(current, requested);
        expect(result.scoreDelta).toBe(result.votesUpDelta - result.votesDownDelta);
      }
    }
  });
});
