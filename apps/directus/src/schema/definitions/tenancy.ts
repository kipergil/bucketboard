import { MEMBERSHIP_ROLE, MEMBERSHIP_STATUS, TENANT_STATUS } from '@bucketboard/shared';
import type { CollectionDefinition } from '../types.js';
import {
  fileField,
  idField,
  integerField,
  jsonField,
  m2o,
  selectField,
  statusField,
  systemTrackingFields,
  textField,
} from '../presets.js';

export const tenantsCollection: CollectionDefinition = {
  collection: 'tenants',
  icon: 'storefront',
  note: 'A vertical / community — the top of the multi-tenancy tree.',
  displayTemplate: '{{name}}',
  fields: [
    idField(),
    textField('name', { required: true }),
    textField('slug', { required: true, unique: true }),
    textField('domain', { unique: true, nullable: true }),
    statusField(TENANT_STATUS, 'draft'),
    textField('description', { interface: 'input-multiline', nullable: true }),
    textField('default_locale', { required: true, maxLength: 16, defaultValue: 'en-GB' }),
    textField('default_currency', { required: true, maxLength: 3, defaultValue: 'GBP' }),
    textField('default_country', { required: true, maxLength: 2, defaultValue: 'GB' }),
    jsonField('settings', { note: 'Theme, feature flags — arbitrary per-tenant config.' }),
    ...systemTrackingFields(),
  ],
  relationFields: [fileField('tenants', 'logo'), fileField('tenants', 'og_image')],
};

const membershipsTenant = m2o('memberships', 'tenant', 'tenants', {
  required: true,
  nullable: false,
  template: '{{name}}',
  oneField: 'memberships',
});
const membershipsUser = m2o('memberships', 'user', 'directus_users', {
  required: true,
  nullable: false,
  template: '{{first_name}} {{last_name}}',
});

export const membershipsCollection: CollectionDefinition = {
  collection: 'memberships',
  icon: 'badge',
  note: 'A user’s role & standing within one tenant. Unique per (tenant, user).',
  displayTemplate: '{{display_name}} — {{role}}',
  fields: [
    idField(),
    selectField('role', MEMBERSHIP_ROLE, { defaultValue: 'member', nullable: false }),
    statusField(MEMBERSHIP_STATUS, 'active'),
    textField('display_name', { nullable: true, note: 'Tenant-scoped public display name.' }),
    integerField('karma', { defaultValue: 0 }),
    ...systemTrackingFields(),
  ],
  relationFields: [membershipsTenant, membershipsUser],
};

export const tenancyCollections: CollectionDefinition[] = [
  tenantsCollection,
  membershipsCollection,
];
