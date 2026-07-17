import Link from 'next/link';
import Image from 'next/image';
import { ArrowBigUp, MessageSquare, Store } from 'lucide-react';
import type { Item } from '@bucketboard/shared';
import { Card, CardContent } from '@/components/ui/card';
import { assetUrl } from '@/lib/directus/assets';

export function ItemCard({ item, tenantSlug }: { item: Item; tenantSlug: string }) {
  const image = assetUrl(item.image, 'card');

  return (
    <Card className="overflow-hidden py-0">
      <Link href={`/t/${tenantSlug}/i/${item.slug}`} className="block">
        <div className="bg-muted aspect-4/3 relative w-full">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <CardContent className="space-y-1.5 p-3">
          <h3 className="line-clamp-2 font-medium leading-snug">{item.title}</h3>
          {item.brand ? <p className="text-muted-foreground text-sm">{item.brand}</p> : null}
          <div className="text-muted-foreground flex items-center gap-3 pt-1 text-xs">
            <span className="flex items-center gap-1">
              <ArrowBigUp className="size-3.5" aria-hidden="true" />
              {item.vote_score}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5" aria-hidden="true" />
              {item.comment_count}
            </span>
            <span className="flex items-center gap-1">
              <Store className="size-3.5" aria-hidden="true" />
              {item.offer_count}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
