import {
  COMMENT_STATUS,
  REPORT_REASON,
  REPORT_STATUS,
  REPORT_TARGET_COLLECTION,
  VOTE_TARGET_COLLECTION,
} from '@bucketboard/shared';
import type { CollectionDefinition } from '../types.js';
import {
  idField,
  m2o,
  richTextField,
  selectField,
  statusField,
  systemTrackingFields,
  textField,
} from '../presets.js';

const votesTenant = m2o('votes', 'tenant', 'tenants', { required: true, nullable: false });
const votesUser = m2o('votes', 'user', 'directus_users', { required: true, nullable: false });

export const votesCollection: CollectionDefinition = {
  collection: 'votes',
  icon: 'thumbs_up_down',
  note: 'One vote per (target, user). Re-voting the same value removes it; the opposite flips it. Polymorphic target (items or retailers) rather than an m2o, so the same collection covers both without duplicating vote logic.',
  displayTemplate: '{{target_collection}} #{{target_id}} — {{value}}',
  fields: [
    idField(),
    selectField('target_collection', VOTE_TARGET_COLLECTION, { nullable: false }),
    textField('target_id', {
      required: true,
      note: 'Primary key of the voted-on item or retailer.',
    }),
    {
      field: 'value',
      type: 'integer',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Up (+1)', value: 1 },
            { text: 'Down (-1)', value: -1 },
          ],
        },
        required: true,
        width: 'half',
      },
      schema: { is_nullable: false },
    },
    ...systemTrackingFields(),
  ],
  relationFields: [votesTenant, votesUser],
};

const commentsTenant = m2o('comments', 'tenant', 'tenants', { required: true, nullable: false });
const commentsItem = m2o('comments', 'item', 'items', {
  required: true,
  nullable: false,
  oneField: 'comments',
});
const commentsUser = m2o('comments', 'user', 'directus_users', { required: true, nullable: false });
const commentsParent = m2o('comments', 'parent', 'comments', {
  nullable: true,
  note: 'One reply level only — enforced in the service layer, not the schema.',
  oneField: 'replies',
});

export const commentsCollection: CollectionDefinition = {
  collection: 'comments',
  icon: 'forum',
  note: 'Item discussion thread, single-level replies.',
  displayTemplate: '{{body}}',
  fields: [
    idField(),
    richTextField('body', { nullable: false }),
    statusField(COMMENT_STATUS, 'published'),
    ...systemTrackingFields(),
  ],
  relationFields: [commentsTenant, commentsItem, commentsUser, commentsParent],
};

const reportsTenant = m2o('reports', 'tenant', 'tenants', { required: true, nullable: false });
const reportsReporter = m2o('reports', 'reporter', 'directus_users', {
  required: true,
  nullable: false,
});
const reportsResolvedBy = m2o('reports', 'resolved_by', 'directus_users', { nullable: true });

export const reportsCollection: CollectionDefinition = {
  collection: 'reports',
  icon: 'flag',
  note: 'Member-filed report against an item, comment, or offer. Moderated in the panel.',
  displayTemplate: '{{target_collection}} #{{target_id}} — {{reason}}',
  fields: [
    idField(),
    selectField('target_collection', REPORT_TARGET_COLLECTION, { nullable: false }),
    textField('target_id', { required: true, note: 'Primary key of the reported row.' }),
    selectField('reason', REPORT_REASON, { nullable: false }),
    textField('details', { interface: 'input-multiline', nullable: true }),
    statusField(REPORT_STATUS, 'open'),
    ...systemTrackingFields(),
  ],
  relationFields: [reportsTenant, reportsReporter, reportsResolvedBy],
};

export const engagementCollections: CollectionDefinition[] = [
  votesCollection,
  commentsCollection,
  reportsCollection,
];
