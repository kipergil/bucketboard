import Link from 'next/link';
import Image from 'next/image';
import type { Retailer } from '@bucketboard/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetUrl } from '@/lib/directus/assets';
import { VoteWidget } from '@/components/voting/vote-widget';

export function RetailerCard({ retailer, tenantSlug }: { retailer: Retailer; tenantSlug: string }) {
  const logo = assetUrl(retailer.logo, 'thumb');

  return (
    <Link href={`/t/${tenantSlug}/s/${retailer.slug}`} className="group">
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="bg-muted ring-border relative size-12 shrink-0 overflow-hidden rounded-full ring-1">
            {logo ? <Image src={logo} alt="" fill sizes="48px" className="object-cover" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="group-hover:text-primary truncate font-medium transition-colors">
              {retailer.name}
            </p>
            <div className="mt-1.5 flex gap-1.5">
              <Badge variant="secondary" className="text-[11px] capitalize">
                {retailer.kind.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-[11px] capitalize">
                {retailer.type}
              </Badge>
            </div>
          </div>
          <VoteWidget
            tenantSlug={tenantSlug}
            targetCollection="retailers"
            targetId={retailer.id}
            initialScore={retailer.vote_score}
            initialUserVote={null}
            size="sm"
            className="shrink-0"
          />
        </CardContent>
      </Card>
    </Link>
  );
}
