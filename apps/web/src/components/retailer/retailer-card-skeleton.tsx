import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RetailerCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center gap-3 p-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-12 w-8 shrink-0 rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function RetailerCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <RetailerCardSkeleton key={index} />
      ))}
    </div>
  );
}
