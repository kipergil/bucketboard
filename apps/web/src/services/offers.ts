import 'server-only';
import { createItem, readItem, updateItem } from '@directus/sdk';
import {
  resolveOutboundUrl,
  type AffiliateProgramLike,
  type ItemOffer,
  type ResolvedOutboundLink,
  type Retailer,
} from '@bucketboard/shared';
import { getServiceDirectusClient } from '../lib/directus/client';
import { getAffiliateProgramById, getRetailerTenantSettings } from './retailers';

function toProgramLike(
  id: string | null,
  program: Awaited<ReturnType<typeof getAffiliateProgramById>>,
): AffiliateProgramLike | null {
  if (!id || !program) return null;
  return { network: program.network, linkTemplate: program.link_template };
}

export interface ResolvedOffer {
  offer: ItemOffer;
  retailer: Retailer;
  link: ResolvedOutboundLink;
}

/**
 * Loads an offer (must be published) and resolves its real outbound URL
 * via the tiered affiliate precedence (packages/shared's
 * resolveOutboundUrl). Used exclusively by the `/go/[offerId]` route —
 * the raw destination URL is never sent to the browser any other way.
 * `/go/` is a global, non-tenant-prefixed route, so the tenant is derived
 * from the offer row itself (an offer belongs to exactly one tenant)
 * rather than from the request host.
 */
export async function resolveOffer(offerId: string): Promise<ResolvedOffer | null> {
  const client = getServiceDirectusClient();

  let offer: ItemOffer;
  try {
    offer = (await client.request(readItem('item_offers', offerId))) as ItemOffer;
  } catch {
    return null;
  }
  if (offer.status !== 'published') return null;

  const tenantId = typeof offer.tenant === 'string' ? offer.tenant : offer.tenant.id;
  const retailerId = typeof offer.retailer === 'string' ? offer.retailer : offer.retailer.id;
  const retailer = (await client.request(readItem('retailers', retailerId))) as Retailer;

  const [offerProgram, retailerProgram, tenantSettings] = await Promise.all([
    getAffiliateProgramById(
      typeof offer.affiliate_program === 'string'
        ? offer.affiliate_program
        : (offer.affiliate_program?.id ?? ''),
    ),
    getAffiliateProgramById(
      typeof retailer.default_affiliate_program === 'string'
        ? retailer.default_affiliate_program
        : (retailer.default_affiliate_program?.id ?? ''),
    ),
    getRetailerTenantSettings(tenantId, retailerId),
  ]);

  const tenantProgram = tenantSettings?.affiliate_program
    ? await getAffiliateProgramById(
        typeof tenantSettings.affiliate_program === 'string'
          ? tenantSettings.affiliate_program
          : tenantSettings.affiliate_program.id,
      )
    : null;

  const link = resolveOutboundUrl({
    offer: {
      url: offer.url,
      externalId: offer.external_id,
      affiliateProgram: toProgramLike(
        typeof offer.affiliate_program === 'string'
          ? offer.affiliate_program
          : (offer.affiliate_program?.id ?? null),
        offerProgram,
      ),
      affiliateId: offer.affiliate_id,
      affiliateParams: offer.affiliate_params,
      affiliateUrl: offer.affiliate_url,
      overrideDefaults: offer.override_defaults,
      isSponsored: offer.is_sponsored,
      nofollow: offer.nofollow,
    },
    retailer: {
      linkTemplate: retailer.link_template,
      defaultAffiliateProgram: toProgramLike(
        typeof retailer.default_affiliate_program === 'string'
          ? retailer.default_affiliate_program
          : (retailer.default_affiliate_program?.id ?? null),
        retailerProgram,
      ),
      defaultAffiliateParams: retailer.default_affiliate_params,
      nofollow: retailer.nofollow,
    },
    tenantSettings: tenantSettings
      ? {
          enabled: tenantSettings.enabled,
          affiliateProgram: toProgramLike(
            typeof tenantSettings.affiliate_program === 'string'
              ? tenantSettings.affiliate_program
              : (tenantSettings.affiliate_program?.id ?? null),
            tenantProgram,
          ),
          affiliateId: tenantSettings.affiliate_id,
          affiliateParams: tenantSettings.affiliate_params,
        }
      : null,
  });

  return { offer, retailer, link };
}

export interface RecordClickInput {
  tenantId: string;
  itemId: string;
  offerId: string;
  retailerId: string;
  userId: string | null;
  referrer: string | null;
  userAgentHash: string | null;
  country: string | null;
}

/** Fire-and-forget: never awaited by the redirect route, so a slow write can't delay the visitor. */
export async function recordOfferClick(input: RecordClickInput): Promise<void> {
  const client = getServiceDirectusClient();
  await client.request(
    createItem(
      'offer_clicks',
      {
        tenant: input.tenantId,
        item: input.itemId,
        offer: input.offerId,
        retailer: input.retailerId,
        user: input.userId,
        referrer: input.referrer,
        user_agent_hash: input.userAgentHash,
        country: input.country,
        created_at: new Date().toISOString(),
      },
      { fields: ['id'] },
    ),
  );
  await client.request(
    updateItem(
      'item_offers',
      input.offerId,
      { click_count: await currentClickCountPlusOne(input.offerId) },
      { fields: ['id'] },
    ),
  );
}

async function currentClickCountPlusOne(offerId: string): Promise<number> {
  const client = getServiceDirectusClient();
  const offer = (await client.request(
    readItem('item_offers', offerId, { fields: ['click_count'] }),
  )) as {
    click_count: number;
  };
  return (offer.click_count ?? 0) + 1;
}

export interface CreateItemOfferInput {
  tenantId: string;
  itemId: string;
  retailerId: string;
  url: string;
  title: string | null;
  price: number | null;
  currency: string | null;
}

/** Member-proposed shop link — always created `pending`, approved by a moderator in the panel. */
export async function createPendingItemOffer(input: CreateItemOfferInput): Promise<void> {
  const client = getServiceDirectusClient();
  await client.request(
    createItem(
      'item_offers',
      {
        tenant: input.tenantId,
        item: input.itemId,
        retailer: input.retailerId,
        url: input.url,
        title: input.title,
        price: input.price,
        currency: input.currency,
        availability: 'unknown',
        status: 'pending',
        verification_status: 'unverified',
      },
      { fields: ['id'] },
    ),
  );
}
