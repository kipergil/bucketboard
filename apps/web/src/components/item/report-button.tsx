'use client';

import { useState, useTransition } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { createReportAction } from '@/actions/reports';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { ReportReason, ReportTargetCollection } from '@bucketboard/shared';

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'spam', label: 'Spam' },
  { value: 'broken_link', label: 'Broken link' },
  { value: 'wrong_info', label: 'Wrong information' },
  { value: 'abuse', label: 'Abuse' },
  { value: 'other', label: 'Other' },
];

export function ReportButton({
  tenantSlug,
  targetCollection,
  targetId,
}: {
  tenantSlug: string;
  targetCollection: ReportTargetCollection;
  targetId: string;
}) {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">
          <Flag className="size-3.5" /> Report
        </Button>
      </SignInButton>
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createReportAction(tenantSlug, {
        targetCollection,
        targetId,
        reason,
        details,
      });
      if (!result.ok) {
        toast.error(result.error ?? 'Could not submit report.');
        return;
      }
      toast.success('Thanks — our moderators will take a look.');
      setOpen(false);
      setDetails('');
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm">
            <Flag className="size-3.5" /> Report
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Reason</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Details (optional)</span>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </label>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending}>
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
