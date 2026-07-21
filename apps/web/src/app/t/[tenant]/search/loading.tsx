import { Skeleton } from '@/components/ui/skeleton';
import { ItemCardSkeletonGrid } from '@/components/item/item-card-skeleton';

export default function SearchLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-64" />
      <div>
        <Skeleton className="mb-3 h-6 w-20" />
        <ItemCardSkeletonGrid count={4} />
      </div>
    </div>
  );
}
