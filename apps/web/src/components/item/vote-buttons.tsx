'use client';

import { useState, useTransition } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { toast } from 'sonner';
import { castVoteAction } from '@/actions/votes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VoteButtons({
  tenantSlug,
  itemId,
  initialScore,
  initialUserVote,
}: {
  tenantSlug: string;
  itemId: string;
  initialScore: number;
  initialUserVote: 1 | -1 | null;
}) {
  const { isSignedIn } = useUser();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [isPending, startTransition] = useTransition();

  function vote(value: 1 | -1) {
    const previousScore = score;
    const previousVote = userVote;

    // Optimistic update
    const optimisticNext = previousVote === value ? null : value;
    const delta = (optimisticNext ?? 0) - (previousVote ?? 0);
    setScore(previousScore + delta);
    setUserVote(optimisticNext);

    startTransition(async () => {
      const result = await castVoteAction(tenantSlug, { itemId, value });
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
      <div className="flex flex-col items-center gap-1">
        <SignInButton mode="modal">
          <Button variant="outline" size="icon-sm" aria-label="Sign in to vote">
            <ArrowBigUp className="size-5" />
          </Button>
        </SignInButton>
        <span className="text-sm font-semibold tabular-nums">{score}</span>
        <SignInButton mode="modal">
          <Button variant="outline" size="icon-sm" aria-label="Sign in to vote">
            <ArrowBigDown className="size-5" />
          </Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        aria-pressed={userVote === 1}
        aria-label="Upvote"
        disabled={isPending}
        onClick={() => vote(1)}
        className={cn(userVote === 1 && 'border-primary text-primary bg-primary/10')}
      >
        <ArrowBigUp className="size-5" />
      </Button>
      <span className="text-sm font-semibold tabular-nums">{score}</span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-pressed={userVote === -1}
        aria-label="Downvote"
        disabled={isPending}
        onClick={() => vote(-1)}
        className={cn(userVote === -1 && 'border-destructive text-destructive bg-destructive/10')}
      >
        <ArrowBigDown className="size-5" />
      </Button>
    </div>
  );
}
