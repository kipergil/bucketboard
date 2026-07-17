import type { AffiliateNetwork } from '../enums.js';
import type { AffiliateParams } from '../collections/commerce.js';

export interface AffiliateProgramLike {
  linkTemplate: string;
  network: AffiliateNetwork;
}

export interface AffiliateTenantSettingsLike {
  enabled: boolean;
  affiliateProgram: AffiliateProgramLike | null;
  affiliateId: string | null;
  affiliateParams: AffiliateParams | null;
}

export interface RetailerLike {
  linkTemplate: string | null;
  defaultAffiliateProgram: AffiliateProgramLike | null;
  defaultAffiliateParams: AffiliateParams | null;
  nofollow: boolean;
}

export interface ItemOfferLike {
  url: string;
  externalId: string | null;
  affiliateProgram: AffiliateProgramLike | null;
  affiliateId: string | null;
  affiliateParams: AffiliateParams | null;
  affiliateUrl: string | null;
  overrideDefaults: boolean;
  isSponsored: boolean;
  nofollow: boolean | null;
}

export interface ResolveOutboundUrlInput {
  offer: ItemOfferLike;
  retailer: RetailerLike;
  tenantSettings: AffiliateTenantSettingsLike | null;
}

export type OutboundLinkSource = 'affiliate_url' | 'offer' | 'tenant' | 'retailer' | 'raw';

export interface ResolvedOutboundLink {
  href: string;
  rel: string;
  source: OutboundLinkSource;
}

function mergeParams(
  ...sources: Array<AffiliateParams | Record<string, string> | null | undefined>
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const source of sources) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source)) {
      if (value !== undefined && value !== null && value !== '') {
        merged[key] = String(value);
      }
    }
  }
  return merged;
}

/**
 * Renders an affiliate link template against a raw destination URL.
 *
 * Templates that start with the literal `{url}` token (the common
 * "retailer appends its own tracking param" shape, e.g. `{url}?tag={affiliate_id}`)
 * are merged onto the real URL with `URLSearchParams` so we never produce
 * a malformed `?a=b?c=d` string and never clobber a query param the
 * destination URL already has. Any other template (typically an affiliate
 * network's redirect wrapper, e.g. Awin's `cread.php?...&ued={encoded_url}`)
 * is rendered as a plain string substitution.
 */
function buildFromTemplate(
  template: string,
  rawUrl: string,
  params: Record<string, string>,
): string {
  const encodedUrl = encodeURIComponent(rawUrl);
  const allParams: Record<string, string> = { ...params, encoded_url: encodedUrl };

  if (template.startsWith('{url}')) {
    const suffix = template.slice('{url}'.length);
    const target = new URL(rawUrl);

    if (suffix) {
      const normalizedSuffix = suffix.startsWith('?') ? suffix.slice(1) : suffix.replace(/^&/, '');
      const rendered = normalizedSuffix.replace(/\{(\w+)\}/g, (_match, key: string) =>
        encodeURIComponent(allParams[key] ?? ''),
      );
      const extraParams = new URLSearchParams(rendered);
      for (const [key, value] of extraParams.entries()) {
        if (value !== '' && !target.searchParams.has(key)) {
          target.searchParams.set(key, value);
        }
      }
    }

    return target.toString();
  }

  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    if (key === 'url') return rawUrl;
    return allParams[key] ?? '';
  });
}

function computeRel(offer: ItemOfferLike, retailer: RetailerLike): string {
  const nofollow = offer.nofollow ?? retailer.nofollow;
  const parts = ['noopener', 'noreferrer'];
  if (nofollow) parts.push('nofollow');
  if (offer.isSponsored) parts.push('sponsored');
  return parts.join(' ');
}

/**
 * Resolves the outbound URL for an item offer following the tiered
 * affiliate precedence (offer override > offer-level program > tenant
 * settings > retailer default > raw URL). Pure and side-effect free —
 * callers are responsible for fetching the (already-expanded) inputs and
 * for recording the click.
 */
export function resolveOutboundUrl(input: ResolveOutboundUrlInput): ResolvedOutboundLink {
  const { offer, retailer, tenantSettings } = input;
  const rel = computeRel(offer, retailer);

  // 1. Hand-crafted link, used verbatim.
  if (offer.overrideDefaults && offer.affiliateUrl) {
    return { href: offer.affiliateUrl, rel, source: 'affiliate_url' };
  }

  // 2. Per-link program override.
  if (offer.affiliateProgram) {
    const params = mergeParams(offer.affiliateParams, {
      affiliate_id: offer.affiliateId ?? '',
      external_id: offer.externalId ?? '',
    });
    const href = buildFromTemplate(offer.affiliateProgram.linkTemplate, offer.url, params);
    return { href, rel, source: 'offer' };
  }

  // 3. Tenant-scoped affiliate credentials.
  if (tenantSettings?.enabled) {
    const template = tenantSettings.affiliateProgram?.linkTemplate ?? retailer.linkTemplate;
    if (template) {
      const params = mergeParams(retailer.defaultAffiliateParams, tenantSettings.affiliateParams, {
        affiliate_id: tenantSettings.affiliateId ?? '',
        external_id: offer.externalId ?? '',
      });
      const href = buildFromTemplate(template, offer.url, params);
      return { href, rel, source: 'tenant' };
    }
  }

  // 4. Retailer-level default.
  const retailerTemplate = retailer.defaultAffiliateProgram?.linkTemplate ?? retailer.linkTemplate;
  if (retailerTemplate) {
    const params = mergeParams(retailer.defaultAffiliateParams, {
      external_id: offer.externalId ?? '',
    });
    const href = buildFromTemplate(retailerTemplate, offer.url, params);
    return { href, rel, source: 'retailer' };
  }

  // 5. No tracking available — raw URL.
  return { href: offer.url, rel, source: 'raw' };
}
