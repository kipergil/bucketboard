import type { FlowDefinition, OperationDefinition } from './types.js';

/**
 * Directus's "action" (post-commit) event payload is NOT uniform across
 * create and update: create gives `{ key, payload: <full row> }`, but
 * update gives `{ keys: [...], payload: <only the changed fields> }` — so
 * a field untouched by a given PATCH (e.g. `item` on a vote whose `value`
 * just flipped) is simply absent from `$trigger.payload`. Every flow below
 * that needs a reliable FK first normalizes the affected row's id, then
 * re-reads the row fresh, rather than trusting `$trigger.payload` directly.
 */
function normalizeIdOperation(resolve: string): OperationDefinition {
  return {
    key: 'normalize_id',
    name: 'Normalize affected row id',
    type: 'exec',
    options: {
      code: [
        'module.exports = async function (data) {',
        '  const t = data.$trigger;',
        '  const id = t.key || (Array.isArray(t.keys) ? t.keys[0] : t.keys);',
        '  return { id };',
        '};',
      ].join('\n'),
    },
    resolve,
  };
}

/**
 * Recomputes votes_up/votes_down/vote_score on the voted-on row (an item
 * OR a retailer — `votes.target_collection`/`target_id` is a polymorphic
 * reference, not an m2o) from the votes table itself whenever a vote is
 * cast or flipped — a self-healing safety net on top of the app's own
 * atomic delta update (packages/shared's toggleVote). Un-voting (a hard
 * DELETE) isn't covered here: Directus's post-commit delete event doesn't
 * retain the deleted row's target fields, so that case is handled
 * transactionally by the server action instead.
 *
 * A single Condition operation forks the chain into an items branch and a
 * retailers branch (each ending in its own item-update, since Directus's
 * item-update operation needs a static `collection` — it can't be
 * templated per-row). The fork can't reference `read_vote.0.target_collection`
 * directly: Directus Condition filters cannot index into an array result
 * (confirmed via the Directus community — https://github.com/directus/directus/discussions/16652),
 * so `extract_target` first flattens the single-row array into plain
 * top-level fields the condition can actually reference.
 */
export const voteCounterFlow: FlowDefinition = {
  name: 'Vote Counter Sync',
  icon: 'thumbs_up_down',
  description: 'Recomputes votes_up/votes_down/vote_score on the voted-on item or retailer.',
  trigger: { type: 'event', scope: ['items.create', 'items.update'], collections: ['votes'] },
  operations: [
    normalizeIdOperation('read_vote'),
    {
      key: 'read_vote',
      name: 'Read the affected vote',
      type: 'item-read',
      options: {
        collection: 'votes',
        permissions: '$full',
        query: {
          filter: { id: { _eq: '{{normalize_id.id}}' } },
          fields: ['target_collection', 'target_id'],
        },
      },
      resolve: 'extract_target',
    },
    {
      key: 'extract_target',
      name: 'Flatten target_collection/target_id',
      type: 'exec',
      options: {
        code: [
          'module.exports = async function (data) {',
          '  const vote = Array.isArray(data.read_vote) ? data.read_vote[0] : null;',
          '  return {',
          '    target_collection: vote ? vote.target_collection : null,',
          '    target_id: vote ? vote.target_id : null,',
          '  };',
          '};',
        ].join('\n'),
      },
      resolve: 'check_is_item',
    },
    {
      key: 'check_is_item',
      name: 'Branch on target_collection',
      type: 'condition',
      options: {
        filter: { $last: { target_collection: { _eq: 'items' } } },
      },
      resolve: 'aggregate_item_votes',
      reject: 'aggregate_retailer_votes',
    },
    {
      key: 'aggregate_item_votes',
      name: 'Aggregate votes for item',
      type: 'item-read',
      options: {
        collection: 'votes',
        permissions: '$full',
        query: {
          filter: {
            target_collection: { _eq: 'items' },
            target_id: { _eq: '{{extract_target.target_id}}' },
          },
          aggregate: { count: '*' },
          groupBy: ['value'],
        },
      },
      resolve: 'compute_item_counts',
    },
    {
      key: 'compute_item_counts',
      name: 'Compute item up/down/score',
      type: 'exec',
      options: {
        code: [
          'module.exports = async function (data) {',
          '  const rows = Array.isArray(data.aggregate_item_votes) ? data.aggregate_item_votes : [];',
          '  let up = 0;',
          '  let down = 0;',
          '  for (const row of rows) {',
          '    const value = Number(row.value);',
          '    const count = Number(row.count ?? 0);',
          '    if (value === 1) up = count;',
          '    if (value === -1) down = count;',
          '  }',
          '  return { votes_up: up, votes_down: down, vote_score: up - down };',
          '};',
        ].join('\n'),
      },
      resolve: 'update_item_counters',
    },
    {
      key: 'update_item_counters',
      name: 'Update item counters',
      type: 'item-update',
      options: {
        collection: 'items',
        key: ['{{extract_target.target_id}}'],
        payload: '{{$last}}',
        permissions: '$full',
        emitEvents: false,
      },
    },
    {
      key: 'aggregate_retailer_votes',
      name: 'Aggregate votes for retailer',
      type: 'item-read',
      options: {
        collection: 'votes',
        permissions: '$full',
        query: {
          filter: {
            target_collection: { _eq: 'retailers' },
            target_id: { _eq: '{{extract_target.target_id}}' },
          },
          aggregate: { count: '*' },
          groupBy: ['value'],
        },
      },
      resolve: 'compute_retailer_counts',
    },
    {
      key: 'compute_retailer_counts',
      name: 'Compute retailer up/down/score',
      type: 'exec',
      options: {
        code: [
          'module.exports = async function (data) {',
          '  const rows = Array.isArray(data.aggregate_retailer_votes) ? data.aggregate_retailer_votes : [];',
          '  let up = 0;',
          '  let down = 0;',
          '  for (const row of rows) {',
          '    const value = Number(row.value);',
          '    const count = Number(row.count ?? 0);',
          '    if (value === 1) up = count;',
          '    if (value === -1) down = count;',
          '  }',
          '  return { votes_up: up, votes_down: down, vote_score: up - down };',
          '};',
        ].join('\n'),
      },
      resolve: 'update_retailer_counters',
    },
    {
      key: 'update_retailer_counters',
      name: 'Update retailer counters',
      type: 'item-update',
      options: {
        collection: 'retailers',
        key: ['{{extract_target.target_id}}'],
        payload: '{{$last}}',
        permissions: '$full',
        emitEvents: false,
      },
    },
  ],
};

/**
 * Recomputes items.comment_count whenever a comment is created or its
 * status changes (published/hidden/removed). Comments are soft-deleted
 * (status -> 'removed'), so — unlike votes — this fully covers the
 * lifecycle without needing a delete-event workaround.
 */
export const commentCounterFlow: FlowDefinition = {
  name: 'Comment Counter Sync',
  icon: 'forum',
  description: 'Recomputes items.comment_count from published comments.',
  trigger: { type: 'event', scope: ['items.create', 'items.update'], collections: ['comments'] },
  operations: [
    normalizeIdOperation('read_comment'),
    {
      key: 'read_comment',
      name: 'Read the affected comment',
      type: 'item-read',
      options: {
        collection: 'comments',
        permissions: '$full',
        query: { filter: { id: { _eq: '{{normalize_id.id}}' } }, fields: ['item'] },
      },
      resolve: 'aggregate_comments',
    },
    {
      key: 'aggregate_comments',
      name: 'Count published comments for item',
      type: 'item-read',
      options: {
        collection: 'comments',
        permissions: '$full',
        query: {
          filter: {
            item: { _eq: '{{read_comment.0.item}}' },
            status: { _eq: 'published' },
          },
          aggregate: { count: '*' },
        },
      },
      resolve: 'compute_count',
    },
    {
      key: 'compute_count',
      name: 'Compute comment_count',
      type: 'exec',
      options: {
        code: [
          'module.exports = async function (data) {',
          '  const rows = Array.isArray(data.aggregate_comments) ? data.aggregate_comments : [];',
          '  const count = Number(rows[0]?.count ?? 0);',
          '  return { comment_count: count };',
          '};',
        ].join('\n'),
      },
      resolve: 'update_item',
    },
    {
      key: 'update_item',
      name: 'Update item comment_count',
      type: 'item-update',
      options: {
        collection: 'items',
        key: ['{{read_comment.0.item}}'],
        payload: '{{$last}}',
        permissions: '$full',
        emitEvents: false,
      },
    },
  ],
};

/**
 * Notifies every active moderator/admin/owner of the reported item's
 * tenant when a new report is filed, so moderation queues don't rely on
 * someone happening to check the panel. Only triggers on create (reports
 * aren't edited by their reporter), so `$trigger.payload` is always the
 * full row and `$trigger.key` is always set.
 */
export const reportNotificationFlow: FlowDefinition = {
  name: 'Report Notifications',
  icon: 'flag',
  description: "Notifies a tenant's moderators/admins when a report is filed.",
  trigger: { type: 'event', scope: ['items.create'], collections: ['reports'] },
  operations: [
    {
      key: 'find_moderators',
      name: 'Find tenant moderators',
      type: 'item-read',
      options: {
        collection: 'memberships',
        permissions: '$full',
        query: {
          filter: {
            tenant: { _eq: '{{$trigger.payload.tenant}}' },
            status: { _eq: 'active' },
            role: { _in: ['moderator', 'admin', 'owner'] },
          },
          fields: ['user'],
        },
      },
      resolve: 'build_notifications',
    },
    {
      key: 'build_notifications',
      name: 'Build notification payloads',
      type: 'exec',
      options: {
        code: [
          'module.exports = async function (data) {',
          '  const moderators = Array.isArray(data.find_moderators) ? data.find_moderators : [];',
          '  const report = data.$trigger.payload;',
          '  const subject = `New report: ${report.reason} on ${report.target_collection}`;',
          '  const message = report.details || `A member reported a ${report.target_collection} item.`;',
          '  return moderators.map((m) => ({',
          '    recipient: m.user,',
          '    subject,',
          '    message,',
          '    collection: "reports",',
          '    item: data.$trigger.key,',
          '  }));',
          '};',
        ].join('\n'),
      },
      resolve: 'create_notifications',
    },
    {
      key: 'create_notifications',
      name: 'Create notifications',
      type: 'item-create',
      options: {
        collection: 'directus_notifications',
        payload: '{{$last}}',
        permissions: '$full',
        emitEvents: false,
      },
    },
  ],
};

/**
 * Sets `path`/`depth` for a single category from its (already-correct)
 * parent on create/update — re-reading the row itself first so a PATCH
 * that only touches `slug` (parent untouched, so absent from the partial
 * update payload) still recomputes correctly. Covers the common cases —
 * new category, rename, slug edit. Deliberately does NOT cascade to
 * descendants: reparenting a category with children needs a full-tenant
 * recompute, which this event-scoped, single-row flow can't safely do (no
 * bulk read/write across the whole tree without risking partial updates
 * mid-flow). Run
 * `pnpm --filter=./apps/directus recompute-category-paths --tenant <slug>`
 * after any reparent that moves a non-leaf category — it reuses the exact
 * same (unit-tested) algorithm as this flow's single-node case.
 */
export const categoryPathFlow: FlowDefinition = {
  name: 'Category Path Sync (single node)',
  icon: 'account_tree',
  description: 'Sets path/depth for a category from its parent. Does not cascade to descendants.',
  trigger: { type: 'event', scope: ['items.create', 'items.update'], collections: ['categories'] },
  operations: [
    normalizeIdOperation('read_self'),
    {
      key: 'read_self',
      name: 'Read the affected category',
      type: 'item-read',
      options: {
        collection: 'categories',
        permissions: '$full',
        query: { filter: { id: { _eq: '{{normalize_id.id}}' } }, fields: ['slug', 'parent'] },
      },
      resolve: 'read_parent',
    },
    {
      key: 'read_parent',
      name: 'Read parent category',
      type: 'item-read',
      options: {
        collection: 'categories',
        permissions: '$full',
        query: {
          filter: { id: { _eq: '{{read_self.0.parent}}' } },
          fields: ['path', 'depth'],
        },
      },
      resolve: 'compute_path',
      reject: 'compute_path',
    },
    {
      key: 'compute_path',
      name: 'Compute path/depth',
      type: 'exec',
      options: {
        code: [
          'module.exports = async function (data) {',
          '  const slug = data.read_self[0].slug;',
          '  const parent = Array.isArray(data.read_parent) ? data.read_parent[0] : null;',
          '  if (!parent) return { path: slug, depth: 0 };',
          '  return { path: `${parent.path}/${slug}`, depth: parent.depth + 1 };',
          '};',
        ].join('\n'),
      },
      resolve: 'update_category',
    },
    {
      key: 'update_category',
      name: 'Update category path/depth',
      type: 'item-update',
      options: {
        collection: 'categories',
        key: ['{{normalize_id.id}}'],
        payload: '{{$last}}',
        permissions: '$full',
        emitEvents: false,
      },
    },
  ],
};

export const allFlows: FlowDefinition[] = [
  voteCounterFlow,
  commentCounterFlow,
  reportNotificationFlow,
  categoryPathFlow,
];
