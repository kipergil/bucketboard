import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { ItemOffer, Retailer, RetailerLocation } from '@bucketboard/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { assetUrl } from '@/lib/directus/assets';

function isExpandedRetailer(retailer: ItemOffer['retailer']): retailer is Retailer {
  return typeof retailer === 'object';
}
function isExpandedLocation(location: ItemOffer['location']): location is RetailerLocation {
  return typeof location === 'object' && location !== null;
}

function OfferRow({ offer, tenantSlug }: { offer: ItemOffer; tenantSlug: string }) {
  const retailer = isExpandedRetailer(offer.retailer) ? offer.retailer : null;
  const location = isExpandedLocation(offer.location) ? offer.location : null;
  const logo = assetUrl(retailer?.logo, 'thumb');

  return (
    <li className="hover:border-primary/30 hover:bg-accent/40 flex items-center gap-3 rounded-xl border p-3 transition-colors">
      <div className="bg-muted ring-border relative size-10 shrink-0 overflow-hidden rounded-full ring-1">
        {logo ? <Image src={logo} alt="" fill sizes="40px" className="object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/t/${tenantSlug}/s/${retailer?.slug ?? ''}`}
            className="hover:text-primary truncate font-medium transition-colors"
          >
            {retailer?.name ?? 'Retailer'}
          </Link>
          {offer.is_official ? (
            <Badge variant="secondary" className="text-[10px]">
              Official
            </Badge>
          ) : null}
          {offer.is_sponsored ? (
            <Badge variant="outline" className="text-[10px]">
              Sponsored
            </Badge>
          ) : null}
        </div>
        {location ? (
          <p className="text-muted-foreground truncate text-xs">{location.name}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {offer.price !== null ? (
          <span className="font-semibold tabular-nums">
            {new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: offer.currency ?? 'GBP',
            }).format(Number(offer.price))}
          </span>
        ) : null}
        <Button
          size="sm"
          render={
            <Link href={`/go/${offer.id}`} target="_blank" rel="noopener noreferrer">
              Buy
              <ExternalLink data-icon="inline-end" />
            </Link>
          }
        />
      </div>
    </li>
  );
}

export function OfferList({ offers, tenantSlug }: { offers: ItemOffer[]; tenantSlug: string }) {
  if (offers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No shops listed yet — be the first to add one.
      </p>
    );
  }

  const online = offers.filter(
    (o) => isExpandedRetailer(o.retailer) && o.retailer.type !== 'physical',
  );
  const physical = offers.filter(
    (o) => isExpandedRetailer(o.retailer) && o.retailer.type === 'physical',
  );

  return (
    <div className="space-y-6">
      {online.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Online</h3>
          <ul className="space-y-2">
            {online.map((offer) => (
              <OfferRow key={offer.id} offer={offer} tenantSlug={tenantSlug} />
            ))}
          </ul>
        </div>
      ) : null}
      {physical.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold">In store</h3>
          <ul className="space-y-2">
            {physical.map((offer) => (
              <OfferRow key={offer.id} offer={offer} tenantSlug={tenantSlug} />
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-muted-foreground text-xs">
        We may earn a commission from purchases made through these links, at no extra cost to you.
        See our{' '}
        <Link href={`/t/${tenantSlug}/affiliate-disclosure`} className="underline">
          affiliate disclosure
        </Link>
        .
      </p>
    </div>
  );
}
