import type { MembershipRole, MembershipStatus, TenantStatus } from '../enums.js';
import type { Relation, SystemFields } from './base.js';
import type { DirectusUser } from './users.js';

export interface TenantSettings {
  theme?: {
    primaryColor?: string;
    logoDark?: string;
  };
  featureFlags?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface Tenant extends SystemFields {
  name: string;
  slug: string;
  domain: string | null;
  status: TenantStatus;
  description: string | null;
  logo: string | null;
  og_image: string | null;
  default_locale: string;
  default_currency: string;
  default_country: string;
  settings: TenantSettings;
}

export interface Membership extends SystemFields {
  tenant: Relation<Tenant>;
  user: Relation<DirectusUser>;
  role: MembershipRole;
  status: MembershipStatus;
  display_name: string | null;
  karma: number;
}
