/** Central registry of every enum used across the BucketBoard data model. */

export const TENANT_STATUS = ['active', 'suspended', 'draft'] as const;
export type TenantStatus = (typeof TENANT_STATUS)[number];

export const MEMBERSHIP_ROLE = ['owner', 'admin', 'moderator', 'member'] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLE)[number];

export const MEMBERSHIP_STATUS = ['active', 'pending', 'banned'] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[number];

export const CATEGORY_STATUS = ['published', 'archived'] as const;
export type CategoryStatus = (typeof CATEGORY_STATUS)[number];

export const TAG_CONTEXT = ['item', 'retailer', 'both'] as const;
export type TagContext = (typeof TAG_CONTEXT)[number];

export const ITEM_STATUS = ['published', 'hidden', 'removed'] as const;
export type ItemStatus = (typeof ITEM_STATUS)[number];

export const ATTRIBUTE_TYPE = [
  'text',
  'number',
  'select',
  'multiselect',
  'boolean',
  'url',
  'date',
] as const;
export type AttributeType = (typeof ATTRIBUTE_TYPE)[number];

export const VOTE_VALUE = [1, -1] as const;
export type VoteValue = (typeof VOTE_VALUE)[number];

export const VOTE_TARGET_COLLECTION = ['items', 'retailers'] as const;
export type VoteTargetCollection = (typeof VOTE_TARGET_COLLECTION)[number];

export const COMMENT_STATUS = ['published', 'hidden', 'removed'] as const;
export type CommentStatus = (typeof COMMENT_STATUS)[number];

export const REPORT_TARGET_COLLECTION = ['items', 'comments', 'item_offers'] as const;
export type ReportTargetCollection = (typeof REPORT_TARGET_COLLECTION)[number];

export const REPORT_REASON = ['spam', 'broken_link', 'wrong_info', 'abuse', 'other'] as const;
export type ReportReason = (typeof REPORT_REASON)[number];

export const REPORT_STATUS = ['open', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUS)[number];

export const RETAILER_TYPE = ['online', 'physical', 'hybrid'] as const;
export type RetailerType = (typeof RETAILER_TYPE)[number];

export const RETAILER_KIND = [
  'marketplace',
  'supermarket',
  'specialist',
  'brand_direct',
  'independent',
] as const;
export type RetailerKind = (typeof RETAILER_KIND)[number];

export const RETAILER_STATUS = ['published', 'draft', 'archived'] as const;
export type RetailerStatus = (typeof RETAILER_STATUS)[number];

export const AFFILIATE_NETWORK = [
  'amazon',
  'awin',
  'skimlinks',
  'impact',
  'cj',
  'direct',
  'other',
] as const;
export type AffiliateNetwork = (typeof AFFILIATE_NETWORK)[number];

export const AFFILIATE_PROGRAM_STATUS = ['active', 'inactive'] as const;
export type AffiliateProgramStatus = (typeof AFFILIATE_PROGRAM_STATUS)[number];

export const OFFER_AVAILABILITY = ['in_stock', 'out_of_stock', 'discontinued', 'unknown'] as const;
export type OfferAvailability = (typeof OFFER_AVAILABILITY)[number];

export const OFFER_STATUS = ['published', 'pending', 'hidden', 'broken'] as const;
export type OfferStatus = (typeof OFFER_STATUS)[number];

export const OFFER_VERIFICATION_STATUS = ['unverified', 'verified', 'dead_link'] as const;
export type OfferVerificationStatus = (typeof OFFER_VERIFICATION_STATUS)[number];

export const ENRICHMENT_STATUS = [
  'pending',
  'processing',
  'enriched',
  'failed',
  'skipped',
] as const;
export type EnrichmentStatus = (typeof ENRICHMENT_STATUS)[number];

export const ENRICHMENT_SOURCE = ['manual', 'ai', 'scrape', 'feed'] as const;
export type EnrichmentSource = (typeof ENRICHMENT_SOURCE)[number];

export const RETAILER_LOCATION_STATUS = ['published', 'draft', 'closed'] as const;
export type RetailerLocationStatus = (typeof RETAILER_LOCATION_STATUS)[number];

export const ENRICHMENT_JOB_TARGET_COLLECTION = ['items', 'item_offers'] as const;
export type EnrichmentJobTargetCollection = (typeof ENRICHMENT_JOB_TARGET_COLLECTION)[number];

export const ENRICHMENT_JOB_TYPE = [
  'discover_offers',
  'enrich_offer',
  'check_link',
  'refresh_price',
] as const;
export type EnrichmentJobType = (typeof ENRICHMENT_JOB_TYPE)[number];

export const ENRICHMENT_JOB_STATUS = ['queued', 'running', 'done', 'failed'] as const;
export type EnrichmentJobStatus = (typeof ENRICHMENT_JOB_STATUS)[number];

export const AUTH_PROVIDER = ['password', 'google', 'apple', 'github', 'facebook'] as const;
export type AuthProvider = (typeof AUTH_PROVIDER)[number];
