import type {
  AffiliateNetwork,
  AffiliateProgramStatus,
  EnrichmentJobStatus,
  EnrichmentJobTargetCollection,
  EnrichmentJobType,
  EnrichmentSource,
  EnrichmentStatus,
  OfferAvailability,
  OfferStatus,
  OfferVerificationStatus,
  RetailerKind,
  RetailerLocationStatus,
  RetailerStatus,
  RetailerType,
} from '../enums';
import type { Relation, SystemFields } from './base';
import type { Tenant } from './tenancy';
import type { Item } from './content';
import type { DirectusUser } from './users';

/** Arbitrary key/value pairs merged into affiliate link templates. */
export type AffiliateParams = Record<string, string>;

export interface AffiliateProgram extends SystemFields {
  name: string;
  slug: string;
  network: AffiliateNetwork;
  link_template: string;
  param_schema: Record<string, string> | null;
  deeplink_supported: boolean;
  status: AffiliateProgramStatus;
  notes: string | null;
}

export interface Retailer extends SystemFields {
  tenant: Relation<Tenant> | null;
  name: string;
  slug: string;
  type: RetailerType;
  kind: RetailerKind;
  website: string | null;
  logo: string | null;
  cover: string | null;
  description: string | null;
  country: string | null;
  currency: string | null;
  domains: string[];
  url_pattern: string | null;
  default_affiliate_program: Relation<AffiliateProgram> | null;
  link_template: string | null;
  default_affiliate_params: AffiliateParams | null;
  nofollow: boolean;
  status: RetailerStatus;
  sort: number | null;
}

export interface RetailerTenantSettings extends SystemFields {
  tenant: Relation<Tenant>;
  retailer: Relation<Retailer>;
  enabled: boolean;
  affiliate_program: Relation<AffiliateProgram> | null;
  affiliate_id: string | null;
  affiliate_params: AffiliateParams | null;
  commission_note: string | null;
}

export interface OpeningHoursSpan {
  opens: string; // "09:00"
  closes: string; // "18:00"
}

export type OpeningHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', OpeningHoursSpan[]>
>;

export interface RetailerLocation extends SystemFields {
  retailer: Relation<Retailer>;
  tenant: Relation<Tenant> | null;
  name: string;
  slug: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  region: string | null;
  postcode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: OpeningHours | null;
  photo: string | null;
  notes: string | null;
  status: RetailerLocationStatus;
}

export interface ItemOffer extends SystemFields {
  tenant: Relation<Tenant>;
  item: Relation<Item>;
  retailer: Relation<Retailer>;
  location: Relation<RetailerLocation> | null;
  title: string | null;
  url: string;
  external_id: string | null;
  affiliate_program: Relation<AffiliateProgram> | null;
  affiliate_id: string | null;
  affiliate_params: AffiliateParams | null;
  affiliate_url: string | null;
  override_defaults: boolean;
  is_official: boolean;
  is_sponsored: boolean;
  nofollow: boolean | null;
  price: number | null;
  currency: string | null;
  price_checked_at: string | null;
  availability: OfferAvailability;
  status: OfferStatus;
  verification_status: OfferVerificationStatus;
  last_checked_at: string | null;
  enrichment_status: EnrichmentStatus;
  enrichment_source: EnrichmentSource | null;
  enriched_at: string | null;
  enrichment_data: Record<string, unknown> | null;
  click_count: number;
  sort: number | null;
}

export interface OfferClick extends SystemFields {
  tenant: Relation<Tenant>;
  item: Relation<Item>;
  offer: Relation<ItemOffer>;
  retailer: Relation<Retailer>;
  user: Relation<DirectusUser> | null;
  referrer: string | null;
  user_agent_hash: string | null;
  country: string | null;
  created_at: string;
}

export interface EnrichmentJob extends SystemFields {
  tenant: Relation<Tenant>;
  target_collection: EnrichmentJobTargetCollection;
  target_id: string;
  job_type: EnrichmentJobType;
  status: EnrichmentJobStatus;
  attempts: number;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error: string | null;
  run_after: string | null;
}
