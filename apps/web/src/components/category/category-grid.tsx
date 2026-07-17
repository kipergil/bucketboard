import Link from 'next/link';
import type { Category } from '@bucketboard/shared';
import { Card, CardContent } from '@/components/ui/card';

export function CategoryGrid({
  categories,
  tenantSlug,
}: {
  categories: Category[];
  tenantSlug: string;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/t/${tenantSlug}/c/${category.path}`} className="group">
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-2.5 p-5 text-center">
              <span
                className="bg-accent flex size-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-105"
                aria-hidden="true"
              >
                {category.icon ?? '🛒'}
              </span>
              <span className="text-sm font-medium">{category.name}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
