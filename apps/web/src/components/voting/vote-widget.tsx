'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { castVoteAction } from '@/actions/votes';
import { cn } from '@/lib/utils';
import type { VoteTargetCollection } from '@bucketboard/shared';

/**
 * Compact, Product Hunt-style up/down vote badge — a vertical pill (chevron,
 * bold count, chevron) that fills with the brand colour once you've voted.
 * Reusable for both items and retailers via `targetCollection`/`targetId`.
 *
 * Stops event propagation on every click so it can be dropped directly
 * inside a card that's itself wrapped in a `<Link>` (item/retailer grid
 * cards) without also triggering navigation.
 *
 * `initialUserVote` is only meaningful when the caller actually fetched the
 * current user's vote for this exact target (the item/retailer detail
 * pages do). Grid/listing cards pass `null` unconditionally — fetching each
 * viewer's vote for every card in a page of 24 would mean N extra queries
 * per page load and would break the public, cache-friendly listing
 * queries. The aggregate score shown is always correct either way; only
 * the "did I vote" highlight starts blank until you interact with that
 * card in this session.
 */
export function VoteWidget({
  tenantSlug,
  targetCollection,
  targetId,
  initialScore,
  initialUserVote,
  size = 'default',
  className,
}: {
  tenantSlug: string;
  targetCollection: VoteTargetCollection;
  targetId: string;
  initialScore: number;
  initialUserVote: 1 | -1 | null;
  size?: 'sm' | 'default';
  className?: string;
}) {
  const { isSignedIn } = useUser();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [isPending, startTransition] = useTransition();
  const isSm = size === 'sm';

  function vote(event: MouseEvent, value: 1 | -1) {
    event.preventDefault();
    event.stopPropagation();
    if (isPending) return;

    const previousScore = score;
    const previousVote = userVote;
    const optimisticNext = previousVote === value ? null : value;
    const delta = (optimisticNext ?? 0) - (previousVote ?? 0);
    setScore(previousScore + delta);
    setUserVote(optimisticNext);

    startTransition(async () => {
      const result = await castVoteAction(tenantSlug, { targetCollection, targetId, value });
      if (!result.ok) {
        setScore(previousScore);
        setUserVote(previousVote);
        toast.error(result.error ?? 'Could not cast vote.');
        return;
      }
      setScore(result.voteScore ?? previousScore);
      setUserVote(result.nextValue ?? null);
    });
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          aria-label="Sign in to vote"
          className={cn(
            'border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-primary flex select-none flex-col items-center justify-center gap-0.5 rounded-lg border transition-colors',
            isSm ? 'w-8 py-1' : 'w-10 py-1.5',
            className,
          )}
        >
          <ChevronUp className={isSm ? 'size-3.5' : 'size-4'} aria-hidden="true" />
          <span className={cn('font-semibold tabular-nums', isSm ? 'text-xs' : 'text-sm')}>
            {score}
          </span>
        </button>
      </SignInButton>
    );
  }

  return (
    <div
      className={cn(
        'flex select-none flex-col items-center justify-center gap-0.5 rounded-lg border transition-colors',
        userVote === 1
          ? 'border-primary bg-primary/10 text-primary'
          : userVote === -1
            ? 'border-destructive bg-destructive/10 text-destructive'
            : 'border-input bg-background text-muted-foreground',
        isSm ? 'w-8 py-1' : 'w-10 py-1.5',
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={userVote === 1}
        aria-label="Upvote"
        disabled={isPending}
        onClick={(event) => vote(event, 1)}
        className="hover:text-primary flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronUp className={isSm ? 'size-3.5' : 'size-4'} aria-hidden="true" />
      </button>
      <span className={cn('font-semibold tabular-nums', isSm ? 'text-xs' : 'text-sm')}>
        {score}
      </span>
      <button
        type="button"
        aria-pressed={userVote === -1}
        aria-label="Downvote"
        disabled={isPending}
        onClick={(event) => vote(event, -1)}
        className="hover:text-destructive flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronDown className={isSm ? 'size-3.5' : 'size-4'} aria-hidden="true" />
      </button>
    </div>
  );
}
