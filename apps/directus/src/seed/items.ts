export interface ItemOfferSeed {
  retailerSlug: string;
  locationSlug?: string;
  title?: string;
  url: string;
  externalId?: string;
  price: number;
  currency: string;
  isOfficial?: boolean;
  availability?: 'in_stock' | 'out_of_stock' | 'discontinued' | 'unknown';
}

export interface ItemSeed {
  title: string;
  slug: string;
  categorySlug: string;
  body: string;
  brand?: string;
  url?: string;
  attributes?: Record<string, unknown>;
  offers: ItemOfferSeed[];
}

export const itemSeeds: ItemSeed[] = [
  {
    title: 'Walkers Ready Salted Crisps',
    slug: 'walkers-ready-salted-crisps',
    categorySlug: 'snacks-crisps',
    brand: 'Walkers',
    body: 'A UK classic. Consistently crunchy, well-salted without being over the top, and the multipack is great value for lunchboxes.',
    attributes: {
      pack_size: '6x25g',
      dietary: ['vegetarian'],
      country_of_origin: 'United Kingdom',
    },
    offers: [
      {
        retailerSlug: 'tesco',
        url: 'https://www.tesco.com/groceries/en-GB/products/walkers-ready-salted-crisps-6x25g',
        externalId: 'TES-WLK-001',
        price: 2.5,
        currency: 'GBP',
        isOfficial: false,
      },
      {
        retailerSlug: 'ocado',
        url: 'https://www.ocado.com/products/walkers-ready-salted-crisps-6x25g',
        externalId: 'OCD-WLK-001',
        price: 2.6,
        currency: 'GBP',
      },
      {
        retailerSlug: 'amazon',
        url: 'https://www.amazon.co.uk/dp/B00EXAMPLE1',
        externalId: 'B00EXAMPLE1',
        price: 11.99,
        currency: 'GBP',
        title: 'Walkers Ready Salted Crisps, 32.5g (Pack of 32)',
      },
    ],
  },
  {
    title: 'Cathedral City Mature Cheddar',
    slug: 'cathedral-city-mature-cheddar',
    categorySlug: 'cheese',
    brand: 'Cathedral City',
    body: "Reliable everyday mature cheddar — good sharpness, melts well, and doesn't break the bank compared to artisan cheeses.",
    attributes: { pack_size: '400g', dietary: ['vegetarian'], country_of_origin: 'United Kingdom' },
    offers: [
      {
        retailerSlug: 'sainsburys',
        url: 'https://www.sainsburys.co.uk/gol-ui/product/cathedral-city-mature-cheddar-400g',
        externalId: 'SAI-CC-400',
        price: 3.75,
        currency: 'GBP',
      },
      {
        retailerSlug: 'tesco',
        url: 'https://www.tesco.com/groceries/en-GB/products/cathedral-city-mature-cheddar-400g',
        externalId: 'TES-CC-400',
        price: 3.6,
        currency: 'GBP',
      },
    ],
  },
  {
    title: 'Yeo Valley Organic Natural Yoghurt',
    slug: 'yeo-valley-organic-natural-yoghurt',
    categorySlug: 'yoghurt',
    brand: 'Yeo Valley',
    body: 'Thick, creamy, and genuinely tastes organic — noticeably less watery than the big-brand alternatives.',
    attributes: { pack_size: '500g', organic: true, dietary: ['vegetarian'] },
    offers: [
      {
        retailerSlug: 'ocado',
        url: 'https://www.ocado.com/products/yeo-valley-organic-natural-yoghurt-500g',
        externalId: 'OCD-YV-500',
        price: 2.1,
        currency: 'GBP',
      },
      {
        retailerSlug: 'sainsburys',
        url: 'https://www.sainsburys.co.uk/gol-ui/product/yeo-valley-organic-natural-yoghurt-500g',
        externalId: 'SAI-YV-500',
        price: 2.15,
        currency: 'GBP',
      },
    ],
  },
  {
    title: 'Warburtons Toastie White Bread',
    slug: 'warburtons-toastie-white-bread',
    categorySlug: 'bread',
    brand: 'Warburtons',
    body: 'Thick-cut and sturdy — holds up well in the toaster without going floppy, and the crust has a good bite.',
    attributes: { pack_size: '800g', dietary: ['vegetarian', 'vegan'] },
    offers: [
      {
        retailerSlug: 'warburtons-direct',
        url: 'https://www.warburtons.co.uk/products/toastie-white',
        title: 'Toastie White',
        price: 1.5,
        currency: 'GBP',
        isOfficial: true,
      },
      {
        retailerSlug: 'tesco',
        url: 'https://www.tesco.com/groceries/en-GB/products/warburtons-toastie-white-800g',
        externalId: 'TES-WAR-800',
        price: 1.45,
        currency: 'GBP',
      },
    ],
  },
  {
    title: 'Union Hand-Roasted Coffee — Ethiopia Yirgacheffe',
    slug: 'union-ethiopia-yirgacheffe',
    categorySlug: 'tea-coffee',
    brand: 'Union Hand-Roasted Coffee',
    body: 'Bright, floral, and genuinely tastes of the region — a step up from supermarket own-brand and worth the extra cost for filter coffee.',
    attributes: { pack_size: '200g', roast_level: 'light', country_of_origin: 'Ethiopia' },
    offers: [
      {
        retailerSlug: 'ocado',
        url: 'https://www.ocado.com/products/union-ethiopia-yirgacheffe-200g',
        externalId: 'OCD-UN-200',
        price: 6.5,
        currency: 'GBP',
      },
      {
        retailerSlug: 'amazon',
        url: 'https://www.amazon.co.uk/dp/B00EXAMPLE2',
        externalId: 'B00EXAMPLE2',
        price: 7.2,
        currency: 'GBP',
      },
    ],
  },
  {
    title: 'Turkish Delight (Assorted, Rose & Pistachio)',
    slug: 'turkish-delight-assorted',
    categorySlug: 'turkish-middle-eastern',
    body: 'Properly soft and fresh — a world away from the dusty stuff in the world foods aisle at the big supermarkets. The pistachio ones go fast.',
    attributes: { pack_size: '500g', dietary: ['vegetarian', 'halal'], spice_level: 'mild' },
    offers: [
      {
        retailerSlug: 'dalston-turkish-supermarket',
        locationSlug: 'kingsland-road',
        url: 'https://example.com/dalston-turkish-supermarket/turkish-delight',
        price: 6.0,
        currency: 'GBP',
        isOfficial: true,
      },
    ],
  },
  {
    title: 'Kalamata Olives in Brine',
    slug: 'kalamata-olives-in-brine',
    categorySlug: 'greek-mediterranean',
    body: 'Meaty, well-brined, and not overly salty. Bought weekly from the deli counter rather than the jarred supermarket version.',
    attributes: {
      pack_size: '400g',
      dietary: ['vegan', 'vegetarian'],
      country_of_origin: 'Greece',
    },
    offers: [
      {
        retailerSlug: 'green-lanes-greek-turkish-deli',
        locationSlug: 'harringay',
        url: 'https://example.com/green-lanes-deli/kalamata-olives',
        price: 4.5,
        currency: 'GBP',
        isOfficial: true,
      },
      {
        retailerSlug: 'wood-green-mediterranean-foods',
        locationSlug: 'high-road',
        url: 'https://example.com/wood-green-mediterranean/kalamata-olives',
        price: 4.8,
        currency: 'GBP',
      },
    ],
  },
  {
    title: 'Lindt Excellence 70% Dark Chocolate',
    slug: 'lindt-excellence-70-dark',
    categorySlug: 'chocolate-sweets',
    brand: 'Lindt',
    body: 'Smooth without being sweet — the 70% hits the right balance for an everyday dark chocolate bar.',
    attributes: { pack_size: '100g', dietary: ['vegetarian', 'gluten_free'] },
    offers: [
      {
        retailerSlug: 'sainsburys',
        url: 'https://www.sainsburys.co.uk/gol-ui/product/lindt-excellence-70-dark-100g',
        externalId: 'SAI-LX-100',
        price: 2.5,
        currency: 'GBP',
      },
      {
        retailerSlug: 'amazon',
        url: 'https://www.amazon.co.uk/dp/B00EXAMPLE3',
        externalId: 'B00EXAMPLE3',
        price: 9.99,
        currency: 'GBP',
        title: 'Lindt Excellence 70% Dark Chocolate Bar, 100g (Pack of 4)',
      },
    ],
  },
];
