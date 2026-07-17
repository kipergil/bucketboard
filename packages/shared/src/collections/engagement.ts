import type {
  CommentStatus,
  ReportReason,
  ReportStatus,
  ReportTargetCollection,
  VoteValue,
} from '../enums';
import type { Relation, SystemFields } from './base';
import type { Tenant } from './tenancy';
import type { Item } from './content';
import type { DirectusUser } from './users';

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
