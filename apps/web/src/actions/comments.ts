'use server';

import { updateTag } from 'next/cache';
import { createCommentSchema, editCommentSchema } from '@bucketboard/shared';
import { authErrorMessage, requireCurrentDirectusUser } from '@/lib/auth/current-user';
import { getTenantBySlug } from '@/services/tenants';
import {
  createComment,
  editComment,
  listCommentsForItem,
  softDeleteComment,
} from '@/services/comments';
import { ensureMembership } from '@/services/users';

export interface CommentActionResult {
  ok: boolean;
  error?: string;
}

export async function createCommentAction(
  tenantSlug: string,
  input: unknown,
): Promise<CommentActionResult> {
  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid comment.' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { ok: false, error: 'Tenant not found.' };

  let user;
  try {
    user = await requireCurrentDirectusUser();
  } catch (error) {
    return { ok: false, error: authErrorMessage(error, 'Sign in to comment.') };
  }

  await ensureMembership(
    tenant.id,
    user.id,
    [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
  );

  // One reply level only — a parent comment that itself has a parent is a
  // second-level reply, not allowed.
  if (parsed.data.parentId) {
    const siblings = await listCommentsForItem(parsed.data.itemId);
    const parent = siblings.find((c) => c.id === parsed.data.parentId);
    if (parent?.parent) {
      return { ok: false, error: 'Replies can only be one level deep.' };
    }
  }

  await createComment({
    tenantId: tenant.id,
    itemId: parsed.data.itemId,
    userId: user.id,
    parentId: parsed.data.parentId ?? null,
    body: parsed.data.body,
  });

  updateTag(`comments:${parsed.data.itemId}`);
  updateTag(`items:${tenant.id}`);

  return { ok: true };
}

export async function editCommentAction(input: unknown): Promise<CommentActionResult> {
  const parsed = editCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid comment.' };
  }

  let user;
  try {
    user = await requireCurrentDirectusUser();
  } catch (error) {
    return { ok: false, error: authErrorMessage(error, 'Sign in required.') };
  }

  try {
    await editComment(parsed.data.commentId, user.id, parsed.data.body);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not edit comment.' };
  }

  return { ok: true };
}

export async function deleteCommentAction(commentId: string): Promise<CommentActionResult> {
  let user;
  try {
    user = await requireCurrentDirectusUser();
  } catch (error) {
    return { ok: false, error: authErrorMessage(error, 'Sign in required.') };
  }

  try {
    await softDeleteComment(commentId, user.id);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not delete comment.',
    };
  }

  return { ok: true };
}
