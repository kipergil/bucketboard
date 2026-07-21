'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
          <TriangleAlert className="size-5 text-neutral-500" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
          <p className="max-w-sm text-balance text-sm text-neutral-500">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
      </body>
    </html>
  );
}
