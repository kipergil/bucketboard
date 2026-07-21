import type { Item, ItemOffer, Retailer, RetailerLocation, Tenant } from '@bucketboard/shared';
import type { BreadcrumbSegment } from '@/components/category/category-breadcrumb';

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export function CategoryJsonLd({
  tenant,
  segments,
}: {
  tenant: Tenant;
  segments: BreadcrumbSegment[];
}) {
  const base = `${siteUrl()}/t/${tenant.slug}`;
  const itemListElement = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: base },
    ...segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: segment.name,
      item: `${base}/c/${segment.path}`,
    })),
  ];

  return (
    <JsonLdScript
      data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement }}
    />
  );
}

export function ItemJsonLd({
  tenant,
  item,
  offers,
  retailerNameById,
}: {
  tenant: Tenant;
  item: Item;
  offers: ItemOffer[];
  retailerNameById: Map<string, string>;
}) {
  const url = `${siteUrl()}/t/${tenant.slug}/i/${item.slug}`;

  const priced = offers.filter((offer) => offer.price !== null);
  const offersJsonLd =
    priced.length > 0
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: priced[0]?.currency ?? tenant.default_currency,
          lowPrice: Math.min(...priced.map((o) => Number(o.price))),
          highPrice: Math.max(...priced.map((o) => Number(o.price))),
          offerCount: priced.length,
          offers: priced.map((offer) => ({
            '@type': 'Offer',
            price: offer.price,
            priceCurrency: offer.currency ?? tenant.default_currency,
            availability: `https://schema.org/${offer.availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`,
            url: `${siteUrl()}/go/${offer.id}`,
            seller: {
              '@type': 'Organization',
              name:
                retailerNameById.get(
                  typeof offer.retailer === 'string' ? offer.retailer : offer.retailer.id,
                ) ?? '',
            },
          })),
        }
      : undefined;

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: item.title,
        description: item.body ?? undefined,
        brand: item.brand ?? undefined,
        image: undefined,
        url,
        ...(offersJsonLd ? { offers: offersJsonLd } : {}),
      }}
    />
  );
}

export function RetailerJsonLd({ retailer }: { retailer: Retailer }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: retailer.name,
        url: retailer.website ?? undefined,
        description: retailer.description ?? undefined,
      }}
    />
  );
}

export function StoreJsonLd({
  retailer,
  location,
}: {
  retailer: Retailer;
  location: RetailerLocation;
}) {
  const openingHoursSpecification = location.opening_hours
    ? Object.entries(location.opening_hours).flatMap(([day, spans]) =>
        (spans ?? []).map((span) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${capitalizeDay(day)}`,
          opens: span.opens,
          closes: span.closes,
        })),
      )
    : undefined;

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'GroceryStore',
        name: location.name,
        parentOrganization: { '@type': 'Organization', name: retailer.name },
        address: {
          '@type': 'PostalAddress',
          streetAddress: location.address_line_1 ?? undefined,
          addressLocality: location.city ?? undefined,
          postalCode: location.postcode ?? undefined,
          addressCountry: location.country ?? undefined,
        },
        geo:
          location.latitude !== null && location.longitude !== null
            ? {
                '@type': 'GeoCoordinates',
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : undefined,
        telephone: location.phone ?? undefined,
        ...(openingHoursSpecification ? { openingHoursSpecification } : {}),
      }}
    />
  );
}

const DAY_NAMES: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

function capitalizeDay(day: string): string {
  return DAY_NAMES[day] ?? day;
}
