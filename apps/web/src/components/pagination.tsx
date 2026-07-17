import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Pagination({
  page,
  pageSize,
  total,
  buildHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-3 pt-4" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        render={<Link href={buildHref(page - 1)}>Previous</Link>}
      />
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        render={<Link href={buildHref(page + 1)}>Next</Link>}
      />
    </nav>
  );
}
