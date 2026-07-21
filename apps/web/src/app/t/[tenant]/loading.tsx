import { Skeleton } from '@/components/ui/skeleton';
import { ItemCardSkeletonGrid } from '@/components/item/item-card-skeleton';
import { RetailerCardSkeletonGrid } from '@/components/retailer/retailer-card-skeleton';

export default function TenantHomeLoading() {
  return (
    <div className="space-y-14 sm:space-y-16">
      <section className="bg-hero-wash relative -mx-4 overflow-hidden rounded-none px-4 py-10 sm:mx-0 sm:rounded-3xl sm:px-10 sm:py-14">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="h-9 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-9 w-2/3 max-w-lg" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      </section>

      <section>
        <Skeleton className="mb-1 h-3 w-16" />
        <Skeleton className="mb-5 h-7 w-44" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="mb-1 h-3 w-24" />
        <Skeleton className="mb-5 h-7 w-32" />
        <ItemCardSkeletonGrid />
      </section>

      <section>
        <Skeleton className="mb-1 h-3 w-20" />
        <Skeleton className="mb-5 h-7 w-28" />
        <ItemCardSkeletonGrid />
      </section>

      <section>
        <Skeleton className="mb-1 h-3 w-24" />
        <Skeleton className="mb-5 h-7 w-40" />
        <RetailerCardSkeletonGrid />
      </section>
    </div>
  );
}
