'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommentForm } from './comment-form';

export function ReplyToggle({
  tenantSlug,
  itemId,
  parentId,
}: {
  tenantSlug: string;
  itemId: string;
  parentId: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Reply
      </Button>
    );
  }

  return (
    <CommentForm
      tenantSlug={tenantSlug}
      itemId={itemId}
      parentId={parentId}
      autoFocus
      onSubmitted={() => {
        setOpen(false);
        router.refresh();
      }}
    />
  );
}
