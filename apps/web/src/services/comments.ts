import 'server-only';
import { createItem, readItems, updateItem } from '@directus/sdk';
import type { Comment } from '@bucketboard/shared';
import { getPublicDirectusClient, getServiceDirectusClient } from '../lib/directus/client';

const COMMENT_FIELDS = [
  'id',
  'tenant',
  'item',
  'user',
  'parent',
  'body',
  'status',
  'date_created',
  'date_updated',
  { user: ['id', 'first_name', 'last_name', 'avatar_url'] },
] as const;

export async function listCommentsForItem(itemId: string): Promise<Comment[]> {
  const client = getPublicDirectusClient();
  const rows = await client.request(
    readItems('comments', {
      filter: { item: { _eq: itemId }, status: { _eq: 'published' } },
      fields: COMMENT_FIELDS,
      sort: ['date_created'],
      limit: -1,
    }),
  );
  return rows as unknown as Comment[];
}

export interface CreateCommentInput {
  tenantId: string;
  itemId: string;
  userId: string;
  parentId: string | null;
  body: string;
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const client = getServiceDirectusClient();
  const comment = await client.request(
    createItem(
      'comments',
      {
        tenant: input.tenantId,
        item: input.itemId,
        user: input.userId,
        parent: input.parentId,
        body: input.body,
        status: 'published',
      },
      { fields: COMMENT_FIELDS },
    ),
  );
  return comment as unknown as Comment;
}

export async function editComment(commentId: string, userId: string, body: string): Promise<void> {
  const client = getServiceDirectusClient();
  const existing = await client.request(
    readItems('comments', { filter: { id: { _eq: commentId } }, fields: ['id', 'user'], limit: 1 }),
  );
  const comment = existing[0] as { id: string; user: string } | undefined;
  if (!comment || comment.user !== userId) {
    throw new Error('Not authorized to edit this comment.');
  }
  await client.request(updateItem('comments', commentId, { body }, { fields: ['id'] }));
}

export async function softDeleteComment(commentId: string, userId: string): Promise<void> {
  const client = getServiceDirectusClient();
  const existing = await client.request(
    readItems('comments', { filter: { id: { _eq: commentId } }, fields: ['id', 'user'], limit: 1 }),
  );
  const comment = existing[0] as { id: string; user: string } | undefined;
  if (!comment || comment.user !== userId) {
    throw new Error('Not authorized to delete this comment.');
  }
  await client.request(
    updateItem('comments', commentId, { status: 'removed' }, { fields: ['id'] }),
  );
}
