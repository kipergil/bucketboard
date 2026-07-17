import type { AttributeType, ItemStatus } from '../enums';
import type { Relation, SystemFields } from './base';
import type { Tenant } from './tenancy';
import type { Category } from './taxonomy';

export interface Item extends SystemFields {
  tenant: Relation<Tenant>;
  category: Relation<Category>;
  title: string;
  slug: string;
  url: string | null;
  image: string | null;
  body: string | null;
  brand: string | null;
  status: ItemStatus;
  vote_score: number;
  votes_up: number;
  votes_down: number;
  comment_count: number;
  offer_count: number;
  hot_score: number;
}

export interface AttributeDefinitionOption {
  label: string;
  value: string;
}

export interface AttributeDefinition extends SystemFields {
  tenant: Relation<Tenant>;
  category: Relation<Category> | null;
  key: string;
  label: string;
  type: AttributeType;
  options: AttributeDefinitionOption[] | null;
  unit: string | null;
  required: boolean;
  filterable: boolean;
  sort: number | null;
}

export type AttributeValue = string | number | boolean | string[] | null;

export interface ItemAttribute extends SystemFields {
  item: Relation<Item>;
  definition: Relation<AttributeDefinition>;
  value: AttributeValue;
}
