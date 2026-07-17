'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchBar({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/t/${tenantSlug}/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search
      </label>
      <Search
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
      />
      <Input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search items, shops, stores…"
        className="pl-8"
      />
    </form>
  );
}
