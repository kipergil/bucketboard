import type { Comment } from '@bucketboard/shared';
import { CommentForm } from './comment-form';
import { ReplyToggle } from './reply-toggle';

type CommentWithUser = Omit<Comment, 'user'> & {
  user:
    | { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null }
    | string;
};

function displayName(user: CommentWithUser['user']): string {
  if (typeof user === 'string') return 'Member';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Member';
}

export function CommentThread({
  tenantSlug,
  itemId,
  comments,
}: {
  tenantSlug: string;
  itemId: string;
  comments: Comment[];
}) {
  const topLevel = comments.filter((c) => !c.parent);
  const repliesByParent = new Map<string, Comment[]>();
  for (const comment of comments) {
    if (comment.parent) {
      const parentId = typeof comment.parent === 'string' ? comment.parent : comment.parent.id;
      const list = repliesByParent.get(parentId) ?? [];
      list.push(comment);
      repliesByParent.set(parentId, list);
    }
  }

  return (
    <div className="space-y-6">
      <CommentForm tenantSlug={tenantSlug} itemId={itemId} />

      {topLevel.length === 0 ? (
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      ) : (
        <ul className="space-y-5">
          {topLevel.map((comment) => (
            <li key={comment.id}>
              <CommentRow comment={comment as CommentWithUser} />
              <ul className="ml-6 mt-3 space-y-3 border-l pl-4">
                {(repliesByParent.get(comment.id) ?? []).map((reply) => (
                  <li key={reply.id}>
                    <CommentRow comment={reply as CommentWithUser} />
                  </li>
                ))}
              </ul>
              <div className="ml-6 mt-2">
                <ReplyToggle tenantSlug={tenantSlug} itemId={itemId} parentId={comment.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentRow({ comment }: { comment: CommentWithUser }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{displayName(comment.user)}</span>
        {comment.date_created ? (
          <span className="text-muted-foreground text-xs">
            {new Date(comment.date_created).toLocaleDateString()}
          </span>
        ) : null}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
    </div>
  );
}
