import Link from 'next/link';
import Image from 'next/image';
import type { Retailer } from '@bucketboard/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetUrl } from '@/lib/directus/assets';

export function RetailerCard({ retailer, tenantSlug }: { retailer: Retailer; tenantSlug: string }) {
  const logo = assetUrl(retailer.logo, 'thumb');

  return (
    <Link href={`/t/${tenantSlug}/s/${retailer.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-full">
            {logo ? <Image src={logo} alt="" fill sizes="48px" className="object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{retailer.name}</p>
            <div className="mt-1 flex gap-1.5">
              <Badge variant="secondary" className="text-[11px]">
                {retailer.kind.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                {retailer.type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
