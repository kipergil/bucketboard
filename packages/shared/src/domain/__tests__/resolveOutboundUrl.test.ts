import { describe, expect, it } from 'vitest';
import {
  resolveOutboundUrl,
  type AffiliateProgramLike,
  type ItemOfferLike,
  type RetailerLike,
} from '../resolveOutboundUrl';

function baseOffer(overrides: Partial<ItemOfferLike> = {}): ItemOfferLike {
  return {
    url: 'https://www.example-shop.com/product/123',
    externalId: null,
    affiliateProgram: null,
    affiliateId: null,
    affiliateParams: null,
    affiliateUrl: null,
    overrideDefaults: false,
    isSponsored: false,
    nofollow: null,
    ...overrides,
  };
}

function baseRetailer(overrides: Partial<RetailerLike> = {}): RetailerLike {
  return {
    linkTemplate: null,
    defaultAffiliateProgram: null,
    defaultAffiliateParams: null,
    nofollow: true,
    ...overrides,
  };
}

const awinProgram: AffiliateProgramLike = {
  network: 'awin',
  linkTemplate:
    'https://www.awin1.com/cread.php?awinmid={merchant_id}&awinaffid={affiliate_id}&ued={encoded_url}',
};

describe('resolveOutboundUrl', () => {
  it('tier 1: uses offer.affiliate_url verbatim when override_defaults is set', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer({
        affiliateUrl: 'https://custom.example/handcrafted-link',
        overrideDefaults: true,
        affiliateProgram: awinProgram,
        affiliateId: 'should-be-ignored',
      }),
      retailer: baseRetailer(),
      tenantSettings: null,
    });

    expect(result).toEqual({
      href: 'https://custom.example/handcrafted-link',
      rel: 'noopener noreferrer nofollow',
      source: 'affiliate_url',
    });
  });

  it('ignores affiliate_url when override_defaults is false', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer({
        affiliateUrl: 'https://custom.example/handcrafted-link',
        overrideDefaults: false,
      }),
      retailer: baseRetailer(),
      tenantSettings: null,
    });

    expect(result.source).not.toBe('affiliate_url');
    expect(result.href).toBe('https://www.example-shop.com/product/123');
  });

  it('tier 2: renders the offer-level affiliate program template with merged params', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer({
        affiliateProgram: awinProgram,
        affiliateId: 'tenant-tag-1',
        affiliateParams: { merchant_id: '5591' },
        externalId: 'SKU-42',
      }),
      retailer: baseRetailer(),
      tenantSettings: null,
    });

    expect(result.source).toBe('offer');
    expect(result.href).toBe(
      'https://www.awin1.com/cread.php?awinmid=5591&awinaffid=tenant-tag-1&ued=' +
        encodeURIComponent('https://www.example-shop.com/product/123'),
    );
  });

  it('tier 3: falls back to tenant settings when no offer-level program is set', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer(),
      retailer: baseRetailer({ linkTemplate: '{url}?tag={affiliate_id}' }),
      tenantSettings: {
        enabled: true,
        affiliateProgram: null,
        affiliateId: 'my-tenant-tag-21',
        affiliateParams: null,
      },
    });

    expect(result.source).toBe('tenant');
    expect(result.href).toBe('https://www.example-shop.com/product/123?tag=my-tenant-tag-21');
  });

  it('tier 3: skips disabled tenant settings and falls through to retailer default', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer(),
      retailer: baseRetailer({ linkTemplate: '{url}?tag={affiliate_id}' }),
      tenantSettings: {
        enabled: false,
        affiliateProgram: null,
        affiliateId: 'ignored-tag',
        affiliateParams: null,
      },
    });

    expect(result.source).toBe('retailer');
  });

  it('tier 4: uses the retailer default affiliate program', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer({ externalId: 'B000123' }),
      retailer: baseRetailer({
        defaultAffiliateProgram: awinProgram,
        defaultAffiliateParams: { merchant_id: '999', affiliate_id: 'retailer-default-tag' },
      }),
      tenantSettings: null,
    });

    expect(result.source).toBe('retailer');
    expect(result.href).toContain('awinmid=999');
    expect(result.href).toContain('awinaffid=retailer-default-tag');
  });

  it('tier 4: uses the retailer plain link_template when there is no program', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer(),
      retailer: baseRetailer({
        linkTemplate: '{url}?tag={affiliate_id}',
        defaultAffiliateParams: { affiliate_id: 'plain-retailer-tag' },
      }),
      tenantSettings: null,
    });

    expect(result.source).toBe('retailer');
    expect(result.href).toBe('https://www.example-shop.com/product/123?tag=plain-retailer-tag');
  });

  it('tier 5: falls back to the raw offer URL with no tracking available anywhere', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer(),
      retailer: baseRetailer(),
      tenantSettings: null,
    });

    expect(result.source).toBe('raw');
    expect(result.href).toBe('https://www.example-shop.com/product/123');
  });

  it('never double-appends a param that already exists on the destination URL', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer({ url: 'https://www.example-shop.com/product/123?tag=already-there' }),
      retailer: baseRetailer({ linkTemplate: '{url}?tag={affiliate_id}' }),
      tenantSettings: {
        enabled: true,
        affiliateProgram: null,
        affiliateId: 'new-tag-would-collide',
        affiliateParams: null,
      },
    });

    const url = new URL(result.href);
    expect(url.searchParams.getAll('tag')).toEqual(['already-there']);
  });

  it('merges additional query params without disturbing existing ones', () => {
    const result = resolveOutboundUrl({
      offer: baseOffer({ url: 'https://www.example-shop.com/product/123?ref=homepage' }),
      retailer: baseRetailer({ linkTemplate: '{url}?tag={affiliate_id}' }),
      tenantSettings: {
        enabled: true,
        affiliateProgram: null,
        affiliateId: 'brand-new-tag',
        affiliateParams: null,
      },
    });

    const url = new URL(result.href);
    expect(url.searchParams.get('ref')).toBe('homepage');
    expect(url.searchParams.get('tag')).toBe('brand-new-tag');
  });

  it('computes rel from nofollow (offer overrides retailer default) and is_sponsored', () => {
    const sponsored = resolveOutboundUrl({
      offer: baseOffer({ isSponsored: true, nofollow: false }),
      retailer: baseRetailer({ nofollow: true }),
      tenantSettings: null,
    });
    expect(sponsored.rel).toBe('noopener noreferrer sponsored');

    const defaultsToRetailer = resolveOutboundUrl({
      offer: baseOffer({ nofollow: null }),
      retailer: baseRetailer({ nofollow: true }),
      tenantSettings: null,
    });
    expect(defaultsToRetailer.rel).toBe('noopener noreferrer nofollow');
  });
});
