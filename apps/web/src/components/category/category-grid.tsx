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
        <Link key={category.id} href={`/t/${tenantSlug}/c/${category.path}`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <span className="text-3xl" aria-hidden="true">
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
