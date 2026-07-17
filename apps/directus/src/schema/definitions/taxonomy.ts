import { CATEGORY_STATUS, TAG_CONTEXT } from '@bucketboard/shared';
import type { CollectionDefinition } from '../types.js';
import {
  fileField,
  idField,
  integerField,
  m2o,
  selectField,
  sortField,
  statusField,
  systemTrackingFields,
  textField,
} from '../presets.js';

const categoriesTenant = m2o('categories', 'tenant', 'tenants', {
  required: true,
  nullable: false,
  template: '{{name}}',
  oneField: 'categories',
});
const categoriesParent = m2o('categories', 'parent', 'categories', {
  nullable: true,
  template: '{{name}}',
  oneField: 'children',
});

export const categoriesCollection: CollectionDefinition = {
  collection: 'categories',
  icon: 'account_tree',
  note: 'Infinitely deep, tenant-owned category tree. `path` is materialized on write.',
  sortField: 'sort',
  displayTemplate: '{{path}}',
  fields: [
    idField(),
    textField('name', { required: true }),
    textField('slug', { required: true, note: 'Unique within (tenant, parent).' }),
    textField('path', {
      required: true,
      note: 'Materialized slash-joined ancestor slugs, e.g. food-drink/snacks/crisps. Unique within tenant.',
    }),
    integerField('depth', { note: 'Derived: number of ancestors.' }),
    textField('description', { interface: 'input-multiline', nullable: true }),
    textField('icon', { nullable: true, note: 'Emoji or icon key.', maxLength: 64 }),
    sortField(),
    statusField(CATEGORY_STATUS, 'published'),
    ...systemTrackingFields(),
  ],
  relationFields: [categoriesTenant, categoriesParent, fileField('categories', 'cover')],
};

const tagsTenant = m2o('tags', 'tenant', 'tenants', {
  nullable: true,
  template: '{{name}}',
  note: 'Nullable = global tag, usable across every tenant.',
});

export const tagsCollection: CollectionDefinition = {
  collection: 'tags',
  icon: 'sell',
  note: 'Free-form classification used by item and retailer filters (e.g. "Turkish supermarket").',
  displayTemplate: '{{name}}',
  fields: [
    idField(),
    textField('name', { required: true }),
    textField('slug', { required: true }),
    selectField('context', TAG_CONTEXT, { defaultValue: 'both', nullable: false }),
    ...systemTrackingFields(),
  ],
  relationFields: [tagsTenant],
};

const itemTagsItem = m2o('item_tags', 'item', 'items', {
  required: true,
  nullable: false,
  oneField: 'tags',
});
const itemTagsTag = m2o('item_tags', 'tag', 'tags', { required: true, nullable: false });

export const itemTagsCollection: CollectionDefinition = {
  collection: 'item_tags',
  icon: 'link',
  note: 'Junction: items <-> tags.',
  displayTemplate: '{{item}} / {{tag}}',
  fields: [idField(), ...systemTrackingFields()],
  relationFields: [itemTagsItem, itemTagsTag],
};

const retailerTagsRetailer = m2o('retailer_tags', 'retailer', 'retailers', {
  required: true,
  nullable: false,
  oneField: 'tags',
});
const retailerTagsTag = m2o('retailer_tags', 'tag', 'tags', { required: true, nullable: false });

export const retailerTagsCollection: CollectionDefinition = {
  collection: 'retailer_tags',
  icon: 'link',
  note: 'Junction: retailers <-> tags (e.g. "Turkish supermarket", "organic", "discounter").',
  displayTemplate: '{{retailer}} / {{tag}}',
  fields: [idField(), ...systemTrackingFields()],
  relationFields: [retailerTagsRetailer, retailerTagsTag],
};

export const taxonomyCollections: CollectionDefinition[] = [
  categoriesCollection,
  tagsCollection,
  itemTagsCollection,
  retailerTagsCollection,
];
