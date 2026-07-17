export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface PermissionRule {
  collection: string;
  action: PermissionAction;
  /** Row-level filter (Directus "permissions" rule). Omit for unrestricted. */
  filter?: Record<string, unknown>;
  /** Field allow-list. Defaults to ['*']. */
  fields?: string[];
  /** Values force-applied on create (e.g. status: 'pending'). */
  presets?: Record<string, unknown>;
}

export interface PolicyDefinition {
  name: string;
  icon: string;
  description: string;
  adminAccess: boolean;
  appAccess: boolean;
  rules: PermissionRule[];
  /** Non-Public policies are attached to a role of the same name. */
  role?: { icon: string };
}

/** Every app collection scoped by a direct `tenant` field, for the memberships-based filter. */
export const OWN_TENANTS_FILTER: Record<string, unknown> = {
  tenant: { _in: '$CURRENT_USER.memberships.tenant' },
};
