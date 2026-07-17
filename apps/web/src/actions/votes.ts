'use server';

import { updateTag } from 'next/cache';
import { castVoteSchema } from '@bucketboard/shared';
import { requireCurrentDirectusUser } from '@/lib/auth/current-user';
import { getTenantBySlug } from '@/services/tenants';
import { castVote } from '@/services/votes';
import { ensureMembership } from '@/services/users';

export interface CastVoteActionResult {
  ok: boolean;
  error?: string;
  voteScore?: number;
  votesUp?: number;
  votesDown?: number;
  nextValue?: 1 | -1 | null;
}

export async function castVoteAction(
  tenantSlug: string,
  input: unknown,
): Promise<CastVoteActionResult> {
  const parsed = castVoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid vote.' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { ok: false, error: 'Tenant not found.' };
  }

  let user;
  try {
    user = await requireCurrentDirectusUser();
  } catch {
    return { ok: false, error: 'Sign in to vote.' };
  }

  await ensureMembership(
    tenant.id,
    user.id,
    [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
  );

  const result = await castVote(tenant.id, parsed.data.itemId, user.id, parsed.data.value);

  updateTag(`items:${tenant.id}`);

  return {
    ok: true,
    voteScore: result.voteScore,
    votesUp: result.votesUp,
    votesDown: result.votesDown,
    nextValue: result.nextValue,
  };
}
