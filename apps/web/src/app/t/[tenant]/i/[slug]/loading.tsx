import { Skeleton } from '@/components/ui/skeleton';

export default function ItemLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-40" />

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-4 w-5" />
          <Skeleton className="size-7 rounded-lg" />
        </div>

        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />

          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
