import { Skeleton } from '@/components/ui/skeleton';
import { ItemCardSkeletonGrid } from '@/components/item/item-card-skeleton';

export default function CategoryLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-48" />

      <div>
        <Skeleton className="h-8 w-56" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>

      <ItemCardSkeletonGrid />
    </div>
  );
}
