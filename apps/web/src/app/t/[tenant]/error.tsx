'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ tenant: string }>();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h1 className="font-heading text-xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground max-w-sm text-balance text-sm">
          We hit a snag loading this page. You can try again, or head back home.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
        <Button
          size="sm"
          render={<Link href={params?.tenant ? `/t/${params.tenant}` : '/'}>Go to homepage</Link>}
        />
      </div>
    </div>
  );
}
