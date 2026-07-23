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
  // Major UK grocers — researched and confirmed live July 2026. No verified
  // Awin/affiliate merchant IDs for these (unlike Tesco/Sainsbury's/Ocado
  // above, which came with real, verified merchant ids) — using 'direct'
  // rather than fabricating a tracking id. Upgrade to 'awin' with a real
  // merchant_id if/when an affiliate account for these is set up.
  {
    name: 'Asda',
    slug: 'asda',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.asda.com',
    description:
      "One of the UK's Big Four supermarkets, with full online grocery delivery and click & collect.",
    country: 'GB',
    currency: 'GBP',
    domains: ['asda.com', 'www.asda.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag'],
  },
  {
    name: 'Morrisons',
    slug: 'morrisons',
    type: 'online',
    kind: 'supermarket',
    website: 'https://groceries.morrisons.com',
    description: "One of the UK's Big Four supermarkets, with full online grocery delivery.",
    country: 'GB',
    currency: 'GBP',
    domains: ['morrisons.com', 'www.morrisons.com', 'groceries.morrisons.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag'],
  },
  {
    name: 'Waitrose & Partners',
    slug: 'waitrose',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.waitrose.com',
    description:
      'Premium UK supermarket, part of the John Lewis Partnership, with full online grocery delivery.',
    country: 'GB',
    currency: 'GBP',
    domains: ['waitrose.com', 'www.waitrose.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag'],
  },
  {
    name: 'Co-op Food',
    slug: 'co-op-food',
    type: 'hybrid',
    kind: 'supermarket',
    website: 'https://shop.coop.co.uk',
    description:
      'UK convenience supermarket chain with online ordering and rapid delivery via Deliveroo, Just Eat, and Uber Eats.',
    country: 'GB',
    currency: 'GBP',
    domains: ['coop.co.uk', 'www.coop.co.uk', 'shop.coop.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag'],
  },
  {
    name: 'Iceland',
    slug: 'iceland',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.iceland.co.uk',
    description:
      'UK supermarket specialising in frozen food, with online grocery delivery nationwide.',
    country: 'GB',
    currency: 'GBP',
    domains: ['iceland.co.uk', 'www.iceland.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag'],
  },
  {
    name: 'M&S Food',
    slug: 'marks-and-spencer-food',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.marksandspencer.com/l/food-and-wine',
    description:
      "Marks & Spencer's premium food range, sold via its own site and the Ocado partnership.",
    country: 'GB',
    currency: 'GBP',
    domains: ['marksandspencer.com', 'www.marksandspencer.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag'],
  },
  {
    name: 'Costco UK',
    slug: 'costco-uk',
    type: 'online',
    kind: 'supermarket',
    website: 'https://www.costco.co.uk',
    description:
      'Membership-only warehouse club with a large online grocery and household section — requires a Costco membership to purchase.',
    country: 'GB',
    currency: 'GBP',
    domains: ['costco.co.uk', 'www.costco.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag'],
  },
  {
    name: 'Aldi',
    slug: 'aldi',
    type: 'physical',
    kind: 'supermarket',
    website: 'https://www.aldi.co.uk',
    description:
      'German-owned discount supermarket chain. No full own-site grocery delivery — only Specialbuys online and a limited Deliveroo rapid-delivery trial in select stores.',
    country: 'GB',
    currency: 'GBP',
    domains: ['aldi.co.uk', 'www.aldi.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['supermarket-tag', 'discounter'],
  },
  // Organic veg-box and doorstep-delivery specialists — popular UK-wide,
  // distinct from the supermarkets above.
  {
    name: 'Abel & Cole',
    slug: 'abel-and-cole',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.abelandcole.co.uk',
    description:
      'Well-known organic fruit & veg box delivery, with add-on dairy, meat, and pantry staples.',
    country: 'GB',
    currency: 'GBP',
    domains: ['abelandcole.co.uk', 'www.abelandcole.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['organic'],
  },
  {
    name: 'Riverford',
    slug: 'riverford',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.riverford.co.uk',
    description: 'Organic farm-to-door fruit & veg box delivery, grown on Riverford’s own farms.',
    country: 'GB',
    currency: 'GBP',
    domains: ['riverford.co.uk', 'www.riverford.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['organic'],
  },
  {
    name: 'Milk & More',
    slug: 'milk-and-more',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.milkandmore.co.uk',
    description:
      'Doorstep milk delivery service that has expanded into a wider grocery range, delivered overnight.',
    country: 'GB',
    currency: 'GBP',
    domains: ['milkandmore.co.uk', 'www.milkandmore.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: [],
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
  // Ships direct from Turkey (country: 'TR') rather than UK-domestic —
  // researched and verified July 2026, same two-independent-network-path
  // method as the UK-based batch above.
  {
    name: 'Grand Bazaar Istanbul',
    slug: 'grand-bazaar-istanbul',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.grandturkishbazaar.com',
    description:
      'Istanbul-based online Turkish grocer shipping worldwide via DHL/FedEx Express, with UK delivery confirmed at 1–3 business days.',
    country: 'TR',
    currency: 'GBP',
    domains: ['grandturkishbazaar.com', 'www.grandturkishbazaar.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'TurkishTaste.com',
    slug: 'turkishtaste',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.turkishtaste.com',
    description:
      'Turkish delight, baklava, coffee, and tea shipped directly from Turkey with fast express delivery.',
    country: 'TR',
    currency: 'GBP',
    domains: ['turkishtaste.com', 'www.turkishtaste.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Gourmeturca',
    slug: 'gourmeturca',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.gourmeturca.com',
    description:
      'Ships authentic Turkish flavours direct from Turkey to 70+ countries via DHL, FedEx, and UPS Express.',
    country: 'TR',
    currency: 'GBP',
    domains: ['gourmeturca.com', 'www.gourmeturca.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Hamido Baklava',
    slug: 'hamido-baklava',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.hamido.com.tr/en/',
    description:
      'Established Gaziantep baklava and pistachio exporter, shipping internationally by air, sea, or land.',
    country: 'TR',
    currency: 'GBP',
    domains: ['hamido.com.tr', 'www.hamido.com.tr'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  // UK-based baklava/Turkish-delight specialists — similar product range,
  // domestic shipping rather than direct-from-Turkey.
  {
    name: 'Anteplie',
    slug: 'anteplie',
    type: 'online',
    kind: 'specialist',
    website: 'https://anteplie.co.uk',
    description:
      'Handmade Gaziantep-style pistachio baklava, delivered UK-wide with next-day options.',
    country: 'GB',
    currency: 'GBP',
    domains: ['anteplie.co.uk', 'www.anteplie.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Anthap',
    slug: 'anthap',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.anthap.co.uk',
    description: 'Turkish baklava and Turkish delight specialist, with free UK delivery over £60.',
    country: 'GB',
    currency: 'GBP',
    domains: ['anthap.co.uk', 'www.anthap.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'Sehr-i Antep',
    slug: 'sehri-antep',
    type: 'online',
    kind: 'specialist',
    website: 'https://sehriantep.co.uk',
    description:
      'Gaziantep-style baklava specialist with UK express delivery in 2–3 business days.',
    country: 'GB',
    currency: 'GBP',
    domains: ['sehriantep.co.uk', 'www.sehriantep.co.uk'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
  {
    name: 'The Turkish Deli',
    slug: 'the-turkish-deli',
    type: 'online',
    kind: 'specialist',
    website: 'https://www.theturkishdeli.com',
    description:
      'Turkish delight, olives, olive oil soap, meze, and roasted Turkish coffee, with GBP pricing for UK customers.',
    country: 'GB',
    currency: 'GBP',
    domains: ['theturkishdeli.com', 'www.theturkishdeli.com'],
    defaultAffiliateProgramSlug: 'direct',
    tags: ['turkish-supermarket'],
  },
];
