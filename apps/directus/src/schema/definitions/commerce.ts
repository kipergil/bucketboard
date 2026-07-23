import {
  AFFILIATE_NETWORK,
  AFFILIATE_PROGRAM_STATUS,
  ENRICHMENT_JOB_STATUS,
  ENRICHMENT_JOB_TARGET_COLLECTION,
  ENRICHMENT_JOB_TYPE,
  ENRICHMENT_SOURCE,
  ENRICHMENT_STATUS,
  OFFER_AVAILABILITY,
  OFFER_STATUS,
  OFFER_VERIFICATION_STATUS,
  RETAILER_KIND,
  RETAILER_LOCATION_STATUS,
  RETAILER_STATUS,
  RETAILER_TYPE,
} from '@bucketboard/shared';
import type { CollectionDefinition } from '../types.js';
import {
  booleanField,
  dateField,
  decimalField,
  fileField,
  idField,
  integerField,
  jsonField,
  m2o,
  richTextField,
  selectField,
  sortField,
  statusField,
  systemTrackingFields,
  textField,
} from '../presets.js';

export const affiliateProgramsCollection: CollectionDefinition = {
  collection: 'affiliate_programs',
  icon: 'handshake',
  note: 'The affiliate network / scheme (Amazon Associates, Awin, direct, ...).',
  displayTemplate: '{{name}}',
  fields: [
    idField(),
    textField('name', { required: true }),
    textField('slug', { required: true, unique: true }),
    selectField('network', AFFILIATE_NETWORK, { defaultValue: 'direct', nullable: false }),
    textField('link_template', {
      required: true,
      interface: 'input-code',
      note: 'e.g. https://www.awin1.com/cread.php?awinmid={merchant_id}&awinaffid={affiliate_id}&ued={encoded_url}',
    }),
    jsonField('param_schema', { note: 'Documents the placeholders this template requires.' }),
    booleanField('deeplink_supported', false),
    statusField(AFFILIATE_PROGRAM_STATUS, 'active'),
    textField('notes', { interface: 'input-multiline', nullable: true }),
    ...systemTrackingFields(),
  ],
  relationFields: [],
};

const retailersTenant = m2o('retailers', 'tenant', 'tenants', {
  nullable: true,
  template: '{{name}}',
  note: 'Null = global/shared retailer catalogue (the common case — do not recreate Amazon per tenant).',
});
const retailersDefaultProgram = m2o(
  'retailers',
  'default_affiliate_program',
  'affiliate_programs',
  { nullable: true, template: '{{name}}' },
);

export const retailersCollection: CollectionDefinition = {
  collection: 'retailers',
  icon: 'storefront',
  note: 'The seller/brand entity — platform-level by default, gets its own landing page.',
  displayTemplate: '{{name}}',
  sortField: 'sort',
  fields: [
    idField(),
    textField('name', { required: true }),
    textField('slug', { required: true, unique: true }),
    selectField('type', RETAILER_TYPE, { defaultValue: 'online', nullable: false }),
    selectField('kind', RETAILER_KIND, { defaultValue: 'supermarket', nullable: false }),
    textField('website', { nullable: true }),
    richTextField('description', { note: 'Rich text for the retailer landing page.' }),
    textField('country', { nullable: true, maxLength: 2 }),
    textField('currency', { nullable: true, maxLength: 3 }),
    jsonField('domains', {
      interface: 'tags',
      note: 'Hostnames used to auto-match a pasted URL to this retailer.',
    }),
    textField('url_pattern', {
      nullable: true,
      note: 'Regex used to extract a product/SKU id from a pasted URL.',
    }),
    textField('link_template', {
      nullable: true,
      interface: 'input-code',
      note: 'Retailer-level default, e.g. {url}?tag={affiliate_id}.',
    }),
    jsonField('default_affiliate_params'),
    booleanField('nofollow', true),
    statusField(RETAILER_STATUS, 'draft'),
    integerField('vote_score', {
      defaultValue: 0,
      note: 'Denormalised, maintained by the vote-counter Flow.',
    }),
    integerField('votes_up', { defaultValue: 0 }),
    integerField('votes_down', { defaultValue: 0 }),
    sortField(),
    ...systemTrackingFields(),
  ],
  relationFields: [
    retailersTenant,
    retailersDefaultProgram,
    fileField('retailers', 'logo'),
    fileField('retailers', 'cover'),
  ],
};

const rtsTenant = m2o('retailer_tenant_settings', 'tenant', 'tenants', {
  required: true,
  nullable: false,
  oneField: 'retailer_settings',
});
const rtsRetailer = m2o('retailer_tenant_settings', 'retailer', 'retailers', {
  required: true,
  nullable: false,
  template: '{{name}}',
  oneField: 'tenant_settings',
});
const rtsProgram = m2o('retailer_tenant_settings', 'affiliate_program', 'affiliate_programs', {
  nullable: true,
  template: '{{name}}',
});

export const retailerTenantSettingsCollection: CollectionDefinition = {
  collection: 'retailer_tenant_settings',
  icon: 'settings_applications',
  note: 'Per-tenant retailer enablement + affiliate credentials. Unique per (tenant, retailer).',
  displayTemplate: '{{tenant}} / {{retailer}}',
  fields: [
    idField(),
    booleanField('enabled', true),
    textField('affiliate_id', { nullable: true, note: "The tenant's own tracking id/tag." }),
    jsonField('affiliate_params', { note: 'Overrides/merges retailer defaults.' }),
    textField('commission_note', { nullable: true }),
    ...systemTrackingFields(),
  ],
  relationFields: [rtsTenant, rtsRetailer, rtsProgram],
};

const locationsRetailer = m2o('retailer_locations', 'retailer', 'retailers', {
  required: true,
  nullable: false,
  template: '{{name}}',
  oneField: 'locations',
});
const locationsTenant = m2o('retailer_locations', 'tenant', 'tenants', {
  nullable: true,
  note: 'Null = shared across tenants.',
});

export const retailerLocationsCollection: CollectionDefinition = {
  collection: 'retailer_locations',
  icon: 'storefront',
  note: 'A physical store branch. A one-off independent shop = a retailer with a single location.',
  displayTemplate: '{{name}}',
  fields: [
    idField(),
    textField('name', { required: true }),
    textField('slug', { required: true, note: 'Unique per retailer.' }),
    textField('address_line_1', { nullable: true }),
    textField('address_line_2', { nullable: true }),
    textField('city', { nullable: true }),
    textField('region', { nullable: true }),
    textField('postcode', { nullable: true, maxLength: 32 }),
    textField('country', { nullable: true, maxLength: 2 }),
    decimalField('latitude', { precision: 9, scale: 6 }),
    decimalField('longitude', { precision: 9, scale: 6 }),
    textField('google_maps_url', { nullable: true }),
    textField('google_place_id', { nullable: true }),
    textField('phone', { nullable: true, maxLength: 64 }),
    textField('email', { nullable: true }),
    textField('website', { nullable: true, note: 'May differ from the parent retailer.' }),
    jsonField('opening_hours', { note: 'Structured per weekday, supports multiple spans.' }),
    textField('notes', { interface: 'input-multiline', nullable: true }),
    statusField(RETAILER_LOCATION_STATUS, 'draft'),
    ...systemTrackingFields(),
  ],
  relationFields: [locationsRetailer, locationsTenant, fileField('retailer_locations', 'photo')],
};

const offersTenant = m2o('item_offers', 'tenant', 'tenants', { required: true, nullable: false });
const offersItem = m2o('item_offers', 'item', 'items', {
  required: true,
  nullable: false,
  oneField: 'offers',
});
const offersRetailer = m2o('item_offers', 'retailer', 'retailers', {
  required: true,
  nullable: false,
  template: '{{name}}',
  oneField: 'offers',
});
const offersLocation = m2o('item_offers', 'location', 'retailer_locations', {
  nullable: true,
  template: '{{name}}',
  note: 'Set when the offer is specific to one physical branch.',
});
const offersProgram = m2o('item_offers', 'affiliate_program', 'affiliate_programs', {
  nullable: true,
  template: '{{name}}',
  note: 'Per-link override of the tenant/retailer default program.',
});

export const itemOffersCollection: CollectionDefinition = {
  collection: 'item_offers',
  icon: 'shopping_cart',
  note: 'Where an item is sold — the item <-> retailer relation. Unique per (item, retailer, external_id).',
  displayTemplate: '{{title}} @ {{retailer}}',
  sortField: 'sort',
  fields: [
    idField(),
    textField('title', { nullable: true, note: "Retailer's own product name." }),
    textField('url', { required: true, note: 'Raw destination URL — never rendered directly.' }),
    textField('external_id', {
      nullable: true,
      note: 'ASIN/SKU extracted via retailer.url_pattern.',
    }),
    textField('affiliate_id', { nullable: true }),
    jsonField('affiliate_params'),
    textField('affiliate_url', {
      nullable: true,
      note: 'A fully hand-crafted link that bypasses all templating.',
    }),
    booleanField('override_defaults', false),
    booleanField('is_official', false, "Brand's own site."),
    booleanField('is_sponsored', false, 'Drives rel="sponsored".'),
    booleanField('nofollow', true, 'Inherits retailer default when unset.'),
    decimalField('price', { precision: 10, scale: 2 }),
    textField('currency', { nullable: true, maxLength: 3 }),
    dateField('price_checked_at'),
    selectField('availability', OFFER_AVAILABILITY, { defaultValue: 'unknown', nullable: false }),
    statusField(OFFER_STATUS, 'pending'),
    selectField('verification_status', OFFER_VERIFICATION_STATUS, {
      defaultValue: 'unverified',
      nullable: false,
    }),
    dateField('last_checked_at'),
    selectField('enrichment_status', ENRICHMENT_STATUS, {
      defaultValue: 'pending',
      nullable: false,
    }),
    selectField('enrichment_source', ENRICHMENT_SOURCE, { nullable: true }),
    dateField('enriched_at'),
    jsonField('enrichment_data', { note: 'Raw payload from the enrichment run.' }),
    integerField('click_count', { defaultValue: 0 }),
    sortField(),
    ...systemTrackingFields(),
  ],
  relationFields: [offersTenant, offersItem, offersRetailer, offersLocation, offersProgram],
};

const clicksTenant = m2o('offer_clicks', 'tenant', 'tenants', { required: true, nullable: false });
const clicksItem = m2o('offer_clicks', 'item', 'items', { required: true, nullable: false });
const clicksOffer = m2o('offer_clicks', 'offer', 'item_offers', {
  required: true,
  nullable: false,
});
const clicksRetailer = m2o('offer_clicks', 'retailer', 'retailers', {
  required: true,
  nullable: false,
});
const clicksUser = m2o('offer_clicks', 'user', 'directus_users', { nullable: true });

export const offerClicksCollection: CollectionDefinition = {
  collection: 'offer_clicks',
  icon: 'ads_click',
  note: 'Outbound click analytics for /go/[offerId], denormalised for cheap aggregation.',
  displayTemplate: '{{offer}} @ {{created_at}}',
  fields: [
    idField(),
    textField('referrer', { nullable: true }),
    textField('user_agent_hash', { nullable: true, note: 'Hashed, no raw PII.' }),
    textField('country', { nullable: true, maxLength: 2 }),
    dateField('created_at', { nullable: false }),
  ],
  relationFields: [clicksTenant, clicksItem, clicksOffer, clicksRetailer, clicksUser],
};

const jobsTenant = m2o('enrichment_jobs', 'tenant', 'tenants', { required: true, nullable: false });

export const enrichmentJobsCollection: CollectionDefinition = {
  collection: 'enrichment_jobs',
  icon: 'auto_awesome',
  note: 'Queue for AI/background link enrichment, drained by a scheduled Flow.',
  displayTemplate: '{{job_type}} — {{target_collection}} #{{target_id}}',
  fields: [
    idField(),
    selectField('target_collection', ENRICHMENT_JOB_TARGET_COLLECTION, { nullable: false }),
    textField('target_id', { required: true }),
    selectField('job_type', ENRICHMENT_JOB_TYPE, { nullable: false }),
    statusField(ENRICHMENT_JOB_STATUS, 'queued'),
    integerField('attempts', { defaultValue: 0 }),
    jsonField('payload'),
    jsonField('result'),
    textField('error', { interface: 'input-multiline', nullable: true }),
    dateField('run_after', { note: 'Backoff scheduling — job is not picked up before this time.' }),
    ...systemTrackingFields(),
  ],
  relationFields: [jobsTenant],
};

export const commerceCollections: CollectionDefinition[] = [
  affiliateProgramsCollection,
  retailersCollection,
  retailerTenantSettingsCollection,
  retailerLocationsCollection,
  itemOffersCollection,
  offerClicksCollection,
  enrichmentJobsCollection,
];
