import { Skeleton } from '@/components/ui/skeleton';
import { RetailerCardSkeletonGrid } from '@/components/retailer/retailer-card-skeleton';

export default function ShopsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-4 w-20" />
      <RetailerCardSkeletonGrid />
    </div>
  );
}
