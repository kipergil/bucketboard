'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import type { RetailerSort } from '@bucketboard/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SORT_OPTIONS: Array<{ value: RetailerSort; label: string }> = [
  { value: 'votes', label: 'Most voted' },
  { value: 'new', label: 'Recently added' },
  { value: 'name_asc', label: 'A to Z' },
  { value: 'name_desc', label: 'Z to A' },
];

export function RetailerSortToolbar({ currentSort }: { currentSort: RetailerSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: RetailerSort | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger aria-label="Sort shops">
        <ArrowUpDown className="text-muted-foreground size-3.5" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
