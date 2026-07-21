import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TenantNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <SearchX className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h1 className="font-heading text-xl font-bold tracking-tight">
          We couldn&rsquo;t find that
        </h1>
        <p className="text-muted-foreground max-w-sm text-balance text-sm">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been removed.
        </p>
      </div>
      <Button size="sm" render={<Link href="/">Go to homepage</Link>} />
    </div>
  );
}
