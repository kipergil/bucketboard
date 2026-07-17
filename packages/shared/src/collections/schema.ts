import type { DirectusUser } from './users.js';
import type { Membership, Tenant } from './tenancy.js';
import type { Category, ItemTag, RetailerTag, Tag } from './taxonomy.js';
import type { AttributeDefinition, Item, ItemAttribute } from './content.js';
import type { Comment, Report, Vote } from './engagement.js';
import type {
  AffiliateProgram,
  EnrichmentJob,
  ItemOffer,
  OfferClick,
  Retailer,
  RetailerLocation,
  RetailerTenantSettings,
} from './commerce.js';

/**
 * The full BucketBoard Directus schema, keyed by collection name. Pass this
 * as the generic to `createDirectus<BucketBoardSchema>(url)` so every SDK
 * call (items, aggregate, etc.) is fully typed end-to-end.
 */
export interface BucketBoardSchema {
  directus_users: DirectusUser[];
  tenants: Tenant[];
  memberships: Membership[];
  categories: Category[];
  tags: Tag[];
  item_tags: ItemTag[];
  retailer_tags: RetailerTag[];
  items: Item[];
  attribute_definitions: AttributeDefinition[];
  item_attributes: ItemAttribute[];
  votes: Vote[];
  comments: Comment[];
  reports: Report[];
  retailers: Retailer[];
  retailer_tenant_settings: RetailerTenantSettings[];
  affiliate_programs: AffiliateProgram[];
  item_offers: ItemOffer[];
  retailer_locations: RetailerLocation[];
  offer_clicks: OfferClick[];
  enrichment_jobs: EnrichmentJob[];
}
