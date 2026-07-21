'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Store } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ANY_RETAILER = '__any__';

export function RetailerFilter({ retailerSlugs }: { retailerSlugs: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ANY_RETAILER) {
      params.set('retailer', value);
    } else {
      params.delete('retailer');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <Select value={searchParams.get('retailer') ?? ANY_RETAILER} onValueChange={handleChange}>
      <SelectTrigger aria-label="Filter by retailer">
        <Store className="text-muted-foreground size-3.5" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY_RETAILER}>Any retailer</SelectItem>
        {retailerSlugs.map((slug) => (
          <SelectItem key={slug} value={slug}>
            {slug}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
