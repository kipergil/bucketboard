import type { PolicyDefinition } from './types.js';
import { OWN_TENANTS_FILTER } from './types.js';

const PUBLISHED = { status: { _eq: 'published' } };
const ACTIVE_TENANT = { status: { _eq: 'active' } };

/**
 * Public (unauthenticated) read access — powers ISR-cached server fetches
 * for anonymous browsing. `item_offers` deliberately excludes raw
 * destination/affiliate fields: the site never renders a raw retailer URL,
 * only `/go/[offerId]`, and that route resolves the real URL server-side
 * with the Service policy. Nothing here can mutate anything.
 */
export const publicPolicy: PolicyDefinition = {
  name: 'Public',
  icon: 'public',
  description: 'Anonymous, read-only access to published content.',
  adminAccess: false,
  appAccess: false,
  rules: [
    { collection: 'tenants', action: 'read', filter: ACTIVE_TENANT },
    // Item images, retailer logos/covers, category covers, store photos —
    // all rendered on public pages, so the Files API needs to serve them
    // to anonymous requests. No sensitive files are ever uploaded through
    // app flows (submissions only accept images).
    { collection: 'directus_files', action: 'read' },
    { collection: 'categories', action: 'read', filter: PUBLISHED },
    { collection: 'tags', action: 'read' },
    { collection: 'item_tags', action: 'read' },
    { collection: 'retailer_tags', action: 'read' },
    { collection: 'items', action: 'read', filter: PUBLISHED },
    { collection: 'attribute_definitions', action: 'read' },
    { collection: 'item_attributes', action: 'read' },
    { collection: 'comments', action: 'read', filter: PUBLISHED },
    { collection: 'retailers', action: 'read', filter: PUBLISHED },
    { collection: 'retailer_locations', action: 'read', filter: PUBLISHED },
    {
      collection: 'item_offers',
      action: 'read',
      filter: PUBLISHED,
      fields: [
        'id',
        'tenant',
        'item',
        'retailer',
        'location',
        'title',
        'is_official',
        'is_sponsored',
        'price',
        'currency',
        'price_checked_at',
        'availability',
        'sort',
      ],
    },
  ],
};

/**
 * Used exclusively by the Next.js BFF's static SERVICE_TOKEN. Broad CRUD
 * across app collections with NO tenant filter — tenant scoping and
 * per-user ownership are enforced in the server action / service layer
 * before this token is ever called, and `user_created`/`user`/`reporter`
 * etc. are always set explicitly rather than inferred from a session.
 * No admin_access, no app_access (no panel login), no schema/role/policy
 * access, no permission to delete users — this is defence in depth, not
 * the primary authorization boundary.
 */
export const servicePolicy: PolicyDefinition = {
  name: 'Service',
  icon: 'dns',
  description: "The Next.js BFF's server-only token. Never exposed to the browser.",
  adminAccess: false,
  appAccess: false,
  role: { icon: 'dns' },
  rules: [
    { collection: 'tenants', action: 'read' },
    { collection: 'memberships', action: 'create' },
    { collection: 'memberships', action: 'read' },
    { collection: 'memberships', action: 'update' },
    { collection: 'categories', action: 'read' },
    { collection: 'tags', action: 'read' },
    { collection: 'item_tags', action: 'read' },
    { collection: 'item_tags', action: 'create' },
    { collection: 'retailer_tags', action: 'read' },
    { collection: 'items', action: 'create' },
    { collection: 'items', action: 'read' },
    { collection: 'items', action: 'update' },
    { collection: 'attribute_definitions', action: 'read' },
    { collection: 'item_attributes', action: 'create' },
    { collection: 'item_attributes', action: 'read' },
    { collection: 'item_attributes', action: 'update' },
    { collection: 'item_attributes', action: 'delete' },
    { collection: 'votes', action: 'create' },
    { collection: 'votes', action: 'read' },
    { collection: 'votes', action: 'update' },
    { collection: 'votes', action: 'delete' },
    { collection: 'comments', action: 'create' },
    { collection: 'comments', action: 'read' },
    { collection: 'comments', action: 'update' },
    { collection: 'reports', action: 'create' },
    { collection: 'reports', action: 'read' },
    { collection: 'retailers', action: 'read' },
    { collection: 'retailers', action: 'update' },
    { collection: 'retailer_tenant_settings', action: 'read' },
    { collection: 'affiliate_programs', action: 'read' },
    { collection: 'item_offers', action: 'create' },
    { collection: 'item_offers', action: 'read' },
    { collection: 'item_offers', action: 'update' },
    { collection: 'retailer_locations', action: 'read' },
    { collection: 'offer_clicks', action: 'create' },
    { collection: 'enrichment_jobs', action: 'create' },
    { collection: 'enrichment_jobs', action: 'read' },
    { collection: 'enrichment_jobs', action: 'update' },
    { collection: 'directus_users', action: 'create' },
    { collection: 'directus_users', action: 'read' },
    { collection: 'directus_users', action: 'update' },
  ],
};

/**
 * Native Directus panel account for tenant owners/admins. `app_access`
 * lets them log into the panel; every rule is scoped to the tenant(s) in
 * their `memberships` row via the shared dynamic-variable filter.
 * (Directus's dynamic filters can't additionally constrain
 * `memberships.role`, so this grants panel access to *any* tenant the
 * staff account belongs to — the service layer is what enforces
 * owner/admin vs. plain member for app-driven actions.)
 */
export const tenantAdminPolicy: PolicyDefinition = {
  name: 'Tenant Admin',
  icon: 'admin_panel_settings',
  description: "Panel access scoped to the staff member's own tenant(s).",
  adminAccess: false,
  appAccess: true,
  role: { icon: 'admin_panel_settings' },
  rules: [
    { collection: 'categories', action: 'create', filter: OWN_TENANTS_FILTER },
    { collection: 'categories', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'categories', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'categories', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'attribute_definitions', action: 'create', filter: OWN_TENANTS_FILTER },
    { collection: 'attribute_definitions', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'attribute_definitions', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'attribute_definitions', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'retailer_tenant_settings', action: 'create', filter: OWN_TENANTS_FILTER },
    { collection: 'retailer_tenant_settings', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'retailer_tenant_settings', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'retailer_tenant_settings', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'memberships', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'memberships', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'memberships', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'items', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'items', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'items', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'comments', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'comments', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'comments', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'item_offers', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'item_offers', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'item_offers', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'reports', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'reports', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'retailers', action: 'read' },
    { collection: 'retailer_locations', action: 'read' },
    { collection: 'affiliate_programs', action: 'read' },
    {
      collection: 'tenants',
      action: 'read',
      filter: { id: { _in: '$CURRENT_USER.memberships.tenant' } },
    },
  ],
};

/**
 * Native Directus panel account for tenant moderators — day-to-day
 * content moderation only, no category/attribute/affiliate/membership
 * management.
 */
export const moderatorPolicy: PolicyDefinition = {
  name: 'Moderator',
  icon: 'gavel',
  description: "Panel moderation access scoped to the staff member's own tenant(s).",
  adminAccess: false,
  appAccess: true,
  role: { icon: 'gavel' },
  rules: [
    { collection: 'categories', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'attribute_definitions', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'items', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'items', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'comments', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'comments', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'comments', action: 'delete', filter: OWN_TENANTS_FILTER },
    { collection: 'item_offers', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'item_offers', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'reports', action: 'read', filter: OWN_TENANTS_FILTER },
    { collection: 'reports', action: 'update', filter: OWN_TENANTS_FILTER },
    { collection: 'retailers', action: 'read' },
    { collection: 'retailer_locations', action: 'read' },
  ],
};

export const allPolicies: PolicyDefinition[] = [servicePolicy, tenantAdminPolicy, moderatorPolicy];
