import type {
  CommentStatus,
  ReportReason,
  ReportStatus,
  ReportTargetCollection,
  VoteValue,
} from '../enums.js';
import type { Relation, SystemFields } from './base.js';
import type { Tenant } from './tenancy.js';
import type { Item } from './content.js';
import type { DirectusUser } from './users.js';

export interface Vote extends SystemFields {
  tenant: Relation<Tenant>;
  item: Relation<Item>;
  user: Relation<DirectusUser>;
  value: VoteValue;
}

export interface Comment extends SystemFields {
  tenant: Relation<Tenant>;
  item: Relation<Item>;
  user: Relation<DirectusUser>;
  parent: Relation<Comment> | null;
  body: string;
  status: CommentStatus;
}

export interface Report extends SystemFields {
  tenant: Relation<Tenant>;
  target_collection: ReportTargetCollection;
  target_id: string;
  reporter: Relation<DirectusUser>;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  resolved_by: Relation<DirectusUser> | null;
}
