'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function RetailerFilter({ retailerSlugs }: { retailerSlugs: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('retailer', value);
    } else {
      params.delete('retailer');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Retailer</span>
      <select
        value={searchParams.get('retailer') ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className="border-input bg-background h-8 rounded-md border px-2 text-sm"
      >
        <option value="">Any</option>
        {retailerSlugs.map((slug) => (
          <option key={slug} value={slug}>
            {slug}
          </option>
        ))}
      </select>
    </label>
  );
}
