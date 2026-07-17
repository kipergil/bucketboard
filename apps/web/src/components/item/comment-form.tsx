'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { createCommentAction } from '@/actions/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function CommentForm({
  tenantSlug,
  itemId,
  parentId,
  onSubmitted,
  autoFocus,
}: {
  tenantSlug: string;
  itemId: string;
  parentId?: string;
  onSubmitted?: () => void;
  autoFocus?: boolean;
}) {
  const { isSignedIn } = useUser();
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button variant="outline" size="sm">
          Sign in to comment
        </Button>
      </SignInButton>
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await createCommentAction(tenantSlug, {
        itemId,
        parentId: parentId ?? null,
        body: trimmed,
      });
      if (!result.ok) {
        toast.error(result.error ?? 'Could not post comment.');
        return;
      }
      setBody('');
      router.refresh();
      onSubmitted?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? 'Write a reply…' : 'Share your thoughts…'}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        maxLength={4000}
      />
      <Button type="submit" size="sm" disabled={isPending || body.trim().length === 0}>
        {parentId ? 'Reply' : 'Comment'}
      </Button>
    </form>
  );
}
