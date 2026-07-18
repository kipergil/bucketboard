export interface AffiliateProgramSeed {
  name: string;
  slug: string;
  network: 'amazon' | 'awin' | 'direct';
  link_template: string;
  param_schema: Record<string, string> | null;
  deeplink_supported: boolean;
  notes: string;
}

export const affiliateProgramSeeds: AffiliateProgramSeed[] = [
  {
    name: 'Amazon Associates',
    slug: 'amazon-associates',
    network: 'amazon',
    link_template: '{url}?tag={affiliate_id}',
    param_schema: null,
    deeplink_supported: true,
    notes: 'Standard Amazon Associates tag param appended to the product URL.',
  },
  {
    name: 'Awin',
    slug: 'awin',
    network: 'awin',
    link_template:
      'https://www.awin1.com/cread.php?awinmid={merchant_id}&awinaffid={affiliate_id}&ued={encoded_url}',
    param_schema: { merchant_id: 'Awin merchant/advertiser id' },
    deeplink_supported: true,
    notes: 'Generic Awin network deep-link wrapper, used by several UK supermarkets.',
  },
  {
    name: 'Direct (no network)',
    slug: 'direct',
    network: 'direct',
    link_template: '{url}',
    param_schema: null,
    deeplink_supported: false,
    notes: 'No affiliate tracking — used for brand-direct sites and independent stores.',
  },
];

export interface RetailerTagSeed {
  name: string;
  slug: string;
  context: 'retailer';
}

export const retailerTagSeeds: RetailerTagSeed[] = [
  { name: 'Supermarket', slug: 'supermarket-tag', context: 'retailer' },
  { name: 'Discounter', slug: 'discounter', context: 'retailer' },
  { name: 'Marketplace', slug: 'marketplace-tag', context: 'retailer' },
  { name: 'Organic', slug: 'organic', context: 'retailer' },
  { name: 'Turkish supermarket', slug: 'turkish-supermarket', context: 'retailer' },
  { name: 'Greek deli', slug: 'greek-deli', context: 'retailer' },
  { name: 'Halal', slug: 'halal', context: 'retailer' },
];

export interface RetailerSeed {
  name: string;
  slug: string;
  type: 'online' | 'physical' | 'hybrid';
  kind: 'marketplace' | 'supermarket' | 'specialist' | 'brand_direct' | 'independent';
  website?: string;
  description: string;
  country: string;
  currency: string;
  domains: string[];
  defaultAffiliateProgramSlug?: string;
  link_template?: string;
  default_affiliate_params?: Record<string, string>;
  tags: string[];
  locations?: Array<{
    name: string;
    slug: string;
    address_line_1: string;
    city: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
    phone?: string;
    opening_hours?: Record<string, Array<{ opens: string; closes: string }>>;
  }>;
}

export const retailerSeeds: RetailerSeed[] = [
  {
    name: 'Ocado',
    slug: 'ocado',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.ocado.com',
    description:
      'UK online-only supermarket, known for its wide range and reliable delivery slots.',
    country: 'GB',
    currency: 'GBP',
    domains: ['ocado.com', 'www.ocado.com'],
    defaultAffiliateProgramSlug: 'awin',
    default_affiliate_params: { merchant_id: '1630' },
    tags: ['supermarket-tag'],
  },
  {
    name: 'Tesco',
    slug: 'tesco',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.tesco.com',
    description: "The UK's largest supermarket chain, with a full online grocery offering.",
    country: 'GB',
    currency: 'GBP',
    domains: ['tesco.com', 'www.tesco.com'],
    defaultAffiliateProgramSlug: 'awin',
    default_affiliate_params: { merchant_id: '1090' },
    tags: ['supermarket-tag'],
  },
  {
    name: "Sainsbury's",
    slug: 'sainsburys',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.sainsburys.co.uk',
    description: 'Major UK supermarket chain with online grocery and Nectar loyalty points.',
    country: 'GB',
    currency: 'GBP',
    domains: ['sainsburys.co.uk', 'www.sainsburys.co.uk'],
    defaultAffiliateProgramSlug: 'awin',
    default_affiliate_params: { merchant_id: '2795' },
    tags: ['supermarket-tag'],
  },
  {
    name: 'Lidl',
    slug: 'lidl',
    type: 'physical',
    kind: 'supermarket',
    website: 'https://www.lidl.co.uk',
    description: 'German-owned discount supermarket chain with UK stores.',
    country: 'GB',
    currency: 'GBP',
    domains: ['lidl.co.uk', 'www.lidl.co.uk'],
    tags: ['supermarket-tag', 'discounter'],
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    type: 'online',
    kind: 'marketplace',
    website: 'https://www.amazon.co.uk',
    description: 'General marketplace, useful for pantry staples, packaged goods, and appliances.',
    country: 'GB',
    currency: 'GBP',
    domains: ['amazon.co.uk', 'www.amazon.co.uk', 'amzn.to'],
    defaultAffiliateProgramSlug: 'amazon-associates',
    tags: ['marketplace-tag'],
  },
  {
    name: 'Warburtons Direct',
    slug: 'warburtons-direct',
    type: 'online',
    kind: 'brand_direct',
    website: 'https://www.warburtons.co.uk',
    description: "The brand's own site — official source for bakery products and recipes.",
    country: 'GB',
    currency: 'GBP',
    domains: ['warburtons.co.uk', 'www.warburtons.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: [],
  },
  {
    name: 'Dalston Turkish Supermarket',
    slug: 'dalston-turkish-supermarket',
    type: 'physical',
    kind: 'independent',
    description:
      'Independent Turkish grocer in Dalston, East London — fresh produce, bakery, and a full deli counter.',
    country: 'GB',
    currency: 'GBP',
    domains: [],
    tags: ['turkish-supermarket', 'halal'],
    locations: [
      {
        name: 'Dalston Turkish Supermarket — Kingsland Road',
        slug: 'kingsland-road',
        address_line_1: '212 Kingsland Road',
        city: 'London',
        postcode: 'E2 8AX',
        country: 'GB',
        latitude: 51.5348,
        longitude: -0.0755,
        phone: '020 7000 0001',
        opening_hours: {
          mon: [{ opens: '08:00', closes: '22:00' }],
          tue: [{ opens: '08:00', closes: '22:00' }],
          wed: [{ opens: '08:00', closes: '22:00' }],
          thu: [{ opens: '08:00', closes: '22:00' }],
          fri: [{ opens: '08:00', closes: '22:00' }],
          sat: [{ opens: '08:00', closes: '22:00' }],
          sun: [{ opens: '09:00', closes: '21:00' }],
        },
      },
    ],
  },
  {
    name: 'Green Lanes Greek & Turkish Deli',
    slug: 'green-lanes-greek-turkish-deli',
    type: 'physical',
    kind: 'independent',
    description:
      'Family-run deli on Green Lanes serving the local Greek and Turkish communities since the 1980s.',
    country: 'GB',
    currency: 'GBP',
    domains: [],
    tags: ['greek-deli', 'turkish-supermarket'],
    locations: [
      {
        name: 'Green Lanes Greek & Turkish Deli — Harringay',
        slug: 'harringay',
        address_line_1: '338 Green Lanes',
        city: 'London',
        postcode: 'N4 1DA',
        country: 'GB',
        latitude: 51.5747,
        longitude: -0.1044,
        phone: '020 7000 0002',
        opening_hours: {
          mon: [{ opens: '08:30', closes: '20:00' }],
          tue: [{ opens: '08:30', closes: '20:00' }],
          wed: [{ opens: '08:30', closes: '20:00' }],
          thu: [{ opens: '08:30', closes: '20:00' }],
          fri: [{ opens: '08:30', closes: '20:00' }],
          sat: [{ opens: '08:30', closes: '20:00' }],
          sun: [{ opens: '09:00', closes: '18:00' }],
        },
      },
    ],
  },
  {
    name: 'Wood Green Mediterranean Foods',
    slug: 'wood-green-mediterranean-foods',
    type: 'physical',
    kind: 'independent',
    description: 'Wide range of Mediterranean and Middle Eastern groceries, olives, and cheeses.',
    country: 'GB',
    currency: 'GBP',
    domains: [],
    tags: ['greek-deli', 'organic'],
    locations: [
      {
        name: 'Wood Green Mediterranean Foods — High Road',
        slug: 'high-road',
        address_line_1: '145 High Road',
        city: 'London',
        postcode: 'N22 6BB',
        country: 'GB',
        latitude: 51.5975,
        longitude: -0.1092,
        phone: '020 7000 0003',
      },
    ],
  },
  // Online-only Turkish/Mediterranean grocery specialists — researched and
  // confirmed live in July 2026 (each independently verified reachable and
  // selling packaged Turkish groceries with UK delivery, not just a parked
  // domain). No known formal affiliate program for any of these, so they
  // use the 'direct' program (untracked outbound link) rather than a
  // fabricated affiliate id.
  {
    name: 'Bonvila',
    slug: 'bonvila',
    type: 'online',
    kind: 'specialist',
    website: 'https://bonvila.com',
    description:
      'Online Turkish and Mediterranean supermarket with London delivery and a wide range of pantry staples, deli, and fresh goods.',
    country: 'GB',
    currency: 'GBP',
    domains: ['bonvila.com', 'www.bonvila.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Best Grocery',
    slug: 'best-grocery',
    type: 'online',
    kind: 'specialist',
    website: 'https://bestgrocery.co.uk',
    description: 'Online Turkish grocery supermarket serving London with fast, low-cost delivery.',
    country: 'GB',
    currency: 'GBP',
    domains: ['bestgrocery.co.uk', 'www.bestgrocery.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Robin Food',
    slug: 'robin-food',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.robinfood.co.uk',
    description:
      "One of the UK's first dedicated Turkish online supermarkets, with same-day London delivery and a companion mobile app.",
    country: 'GB',
    currency: 'GBP',
    domains: ['robinfood.co.uk', 'www.robinfood.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Bakkalim',
    slug: 'bakkalim',
    type: 'online',
    kind: 'specialist',
    website: 'https://bakkalim.co.uk',
    description:
      'Online Turkish and Mediterranean grocery supermarket stocking 2,000+ products, with free next-day UK delivery over £60.',
    country: 'GB',
    currency: 'GBP',
    domains: ['bakkalim.co.uk', 'www.bakkalim.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'London Grocery',
    slug: 'london-grocery',
    type: 'online',
    kind: 'specialist',
    website: 'https://londongrocery.net',
    description:
      'General online grocery delivery service with a dedicated Turkish products range, delivering across the UK.',
    country: 'GB',
    currency: 'GBP',
    domains: ['londongrocery.net', 'www.londongrocery.net'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'The Turkish Shop',
    slug: 'the-turkish-shop',
    type: 'online',
    kind: 'specialist',
    website: 'https://theturkishshop.com',
    description: 'Large online range of Turkish grocery, food, and drinks with free UK delivery.',
    country: 'GB',
    currency: 'GBP',
    domains: ['theturkishshop.com', 'www.theturkishshop.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Turkish Porter',
    slug: 'turkish-porter',
    type: 'online',
    kind: 'specialist',
    website: 'https://turkishporter.com',
    description:
      'UK-based online Turkish grocer offering next-day delivery of authentic Turkish essentials.',
    country: 'GB',
    currency: 'GBP',
    domains: ['turkishporter.com', 'www.turkishporter.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'MarkeTurk',
    slug: 'marketurk',
    type: 'online',
    kind: 'specialist',
    website: 'https://marketurk.co.uk',
    description:
      'Online Turkish supermarket using a personal-shopper model — same-day London delivery, Royal Mail nationwide.',
    country: 'GB',
    currency: 'GBP',
    domains: ['marketurk.co.uk', 'www.marketurk.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Turkish Food Centre',
    slug: 'turkish-food-centre',
    type: 'online',
    kind: 'specialist',
    website: 'https://tfcsupermarket.com',
    description:
      'Well-established online Turkish supermarket serving the UK with staples, fresh produce, and quality meat; free delivery over £60.',
    country: 'GB',
    currency: 'GBP',
    domains: ['tfcsupermarket.com', 'www.tfcsupermarket.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Turkish Online Market',
    slug: 'turkish-online-market',
    type: 'online',
    kind: 'specialist',
    website: 'https://turkishonlinemarket.co.uk',
    description: 'UK-wide online Turkish grocery food market.',
    country: 'GB',
    currency: 'GBP',
    domains: ['turkishonlinemarket.co.uk', 'www.turkishonlinemarket.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Grocina',
    slug: 'grocina',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.grocina.com',
    description:
      'UK online Turkish and Mediterranean market stocking Turkish tea, delight, and pantry staples.',
    country: 'GB',
    currency: 'GBP',
    domains: ['grocina.com', 'www.grocina.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'TurkShop',
    slug: 'turkshop',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.turkshop.co.uk',
    description: "One of the UK's largest online Turkish products shops.",
    country: 'GB',
    currency: 'GBP',
    domains: ['turkshop.co.uk', 'www.turkshop.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
];
