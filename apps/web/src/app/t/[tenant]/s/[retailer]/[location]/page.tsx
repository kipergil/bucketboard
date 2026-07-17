import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTenantBySlug } from '@/services/tenants';
import { getRetailerBySlug, getRetailerLocationBySlug } from '@/services/retailers';
import { assetUrl } from '@/lib/directus/assets';
import { StoreJsonLd } from '@/components/seo/json-ld';
import { isStoreOpenNow } from '@/services/openingHours';
import { Badge } from '@/components/ui/badge';

interface StorePageProps {
  params: Promise<{ tenant: string; retailer: string; location: string }>;
}

async function load(props: StorePageProps) {
  const { tenant: tenantSlug, retailer: retailerSlug, location: locationSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;
  const retailer = await getRetailerBySlug(retailerSlug);
  if (!retailer) return null;
  const location = await getRetailerLocationBySlug(retailer.id, locationSlug);
  if (!location) return null;
  return { tenant, retailer, location };
}

export async function generateMetadata(props: StorePageProps): Promise<Metadata> {
  const loaded = await load(props);
  if (!loaded) return {};
  return {
    title: loaded.location.name,
    description: `${loaded.location.name} — ${loaded.location.address_line_1 ?? ''}, ${loaded.location.city ?? ''}`,
  };
}

const DAY_LABELS: Array<[string, string]> = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

export default async function StorePage(props: StorePageProps) {
  const loaded = await load(props);
  if (!loaded) notFound();
  const { tenant, retailer, location } = loaded;

  const photo = assetUrl(location.photo, 'cover');
  const openNow = isStoreOpenNow(location.opening_hours);

  return (
    <div className="space-y-6">
      <StoreJsonLd retailer={retailer} location={location} />

      {photo ? (
        <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
          <Image src={photo} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      ) : null}

      <div>
        <Link
          href={`/t/${tenant.slug}/s/${retailer.slug}`}
          className="text-primary text-sm hover:underline"
        >
          {retailer.name}
        </Link>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{location.name}</h1>
        {location.opening_hours ? (
          <Badge variant={openNow ? 'default' : 'secondary'} className="mt-1">
            {openNow ? 'Open now' : 'Closed now'}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <h2 className="font-semibold">Address</h2>
          <p>
            {location.address_line_1}
            {location.address_line_2 ? <>, {location.address_line_2}</> : null}
            <br />
            {location.city}, {location.postcode}
          </p>
          {location.phone ? <p>{location.phone}</p> : null}
          {location.google_maps_url ? (
            <Link
              href={location.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on Google Maps
            </Link>
          ) : null}
        </div>

        {location.opening_hours ? (
          <div className="text-sm">
            <h2 className="mb-2 font-semibold">Opening hours</h2>
            <dl className="space-y-1">
              {DAY_LABELS.map(([key, label]) => {
                const spans = location.opening_hours?.[key as keyof typeof location.opening_hours];
                return (
                  <div key={key} className="flex justify-between">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>
                      {spans && spans.length > 0
                        ? spans.map((s) => `${s.opens}–${s.closes}`).join(', ')
                        : 'Closed'}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ) : null}
      </div>

      {location.notes ? <p className="text-muted-foreground">{location.notes}</p> : null}
    </div>
  );
}
