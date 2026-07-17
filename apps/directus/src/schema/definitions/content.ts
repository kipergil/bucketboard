import { ATTRIBUTE_TYPE, ITEM_STATUS } from '@bucketboard/shared';
import type { CollectionDefinition } from '../types.js';
import {
  booleanField,
  fileField,
  floatField,
  idField,
  integerField,
  jsonField,
  m2o,
  richTextField,
  selectField,
  statusField,
  systemTrackingFields,
  textField,
} from '../presets.js';

const itemsTenant = m2o('items', 'tenant', 'tenants', {
  required: true,
  nullable: false,
  template: '{{name}}',
  oneField: 'items',
});
const itemsCategory = m2o('items', 'category', 'categories', {
  required: true,
  nullable: false,
  template: '{{path}}',
  oneField: 'items',
});

export const itemsCollection: CollectionDefinition = {
  collection: 'items',
  icon: 'inventory_2',
  note: 'A member-submitted favourite: title, link, picture, review — the core content unit.',
  displayTemplate: '{{title}}',
  archiveField: 'status',
  archiveValue: 'removed',
  unarchiveValue: 'published',
  fields: [
    idField(),
    textField('title', { required: true }),
    textField('slug', { required: true, note: 'Unique within tenant.' }),
    textField('url', { nullable: true, note: 'Canonical / reference link.' }),
    richTextField('body', { note: "The member's review." }),
    textField('brand', { nullable: true, maxLength: 120 }),
    statusField(ITEM_STATUS, 'published'),
    integerField('vote_score', {
      defaultValue: 0,
      note: 'Denormalised, maintained by the vote-counter Flow.',
    }),
    integerField('votes_up', { defaultValue: 0 }),
    integerField('votes_down', { defaultValue: 0 }),
    integerField('comment_count', { defaultValue: 0 }),
    integerField('offer_count', { defaultValue: 0 }),
    floatField('hot_score', {
      defaultValue: 0,
      note: 'Age-decayed ranking score, maintained by a scheduled Flow.',
    }),
    ...systemTrackingFields(),
  ],
  relationFields: [itemsTenant, itemsCategory, fileField('items', 'image')],
};

const attributeDefinitionsTenant = m2o('attribute_definitions', 'tenant', 'tenants', {
  required: true,
  nullable: false,
  template: '{{name}}',
});
const attributeDefinitionsCategory = m2o('attribute_definitions', 'category', 'categories', {
  nullable: true,
  template: '{{path}}',
  note: 'Nullable = applies tenant-wide; otherwise scoped to this subtree.',
});

export const attributeDefinitionsCollection: CollectionDefinition = {
  collection: 'attribute_definitions',
  icon: 'tune',
  note: 'Vertical-specific item fields, defined per tenant without schema changes.',
  displayTemplate: '{{label}}',
  fields: [
    idField(),
    textField('key', {
      required: true,
      note: 'Unique within tenant, used as the item_attributes lookup key.',
    }),
    textField('label', { required: true }),
    selectField('type', ATTRIBUTE_TYPE, { defaultValue: 'text', nullable: false }),
    jsonField('options', { note: 'Choice list for select/multiselect types.' }),
    textField('unit', { nullable: true, maxLength: 32, note: 'e.g. g, ml.' }),
    booleanField('required', false),
    booleanField('filterable', false, 'Surfaces as a facet on the category page.'),
    integerField('sort', { nullable: true }),
    ...systemTrackingFields(),
  ],
  relationFields: [attributeDefinitionsTenant, attributeDefinitionsCategory],
};

const itemAttributesItem = m2o('item_attributes', 'item', 'items', {
  required: true,
  nullable: false,
  oneField: 'attributes',
});
const itemAttributesDefinition = m2o('item_attributes', 'definition', 'attribute_definitions', {
  required: true,
  nullable: false,
  template: '{{label}}',
});

export const itemAttributesCollection: CollectionDefinition = {
  collection: 'item_attributes',
  icon: 'list_alt',
  note: 'Item <-> attribute_definitions value store. Unique per (item, definition).',
  displayTemplate: '{{definition}}: {{value}}',
  fields: [idField(), jsonField('value'), ...systemTrackingFields()],
  relationFields: [itemAttributesItem, itemAttributesDefinition],
};

export const contentCollections: CollectionDefinition[] = [
  itemsCollection,
  attributeDefinitionsCollection,
  itemAttributesCollection,
];
