import type { CategoryStatus, TagContext } from '../enums.js';
import type { Relation, SystemFields } from './base.js';
import type { Item } from './content.js';
import type { Tenant } from './tenancy.js';
import type { Retailer } from './commerce.js';

export interface Category extends SystemFields {
  tenant: Relation<Tenant>;
  parent: Relation<Category> | null;
  name: string;
  slug: string;
  path: string;
  depth: number;
  description: string | null;
  icon: string | null;
  cover: string | null;
  sort: number | null;
  status: CategoryStatus;
}

export interface Tag extends SystemFields {
  tenant: Relation<Tenant> | null;
  name: string;
  slug: string;
  context: TagContext;
}

export interface ItemTag extends SystemFields {
  item: Relation<Item>;
  tag: Relation<Tag>;
}

export interface RetailerTag extends SystemFields {
  retailer: Relation<Retailer>;
  tag: Relation<Tag>;
}
