'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import type { ItemSort } from '@bucketboard/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SORT_OPTIONS: Array<{ value: ItemSort; label: string }> = [
  { value: 'top_all', label: 'Top (all time)' },
  { value: 'top_month', label: 'Top (this month)' },
  { value: 'top_week', label: 'Top (this week)' },
  { value: 'new', label: 'New' },
];

export function SortToolbar({ currentSort }: { currentSort: ItemSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: ItemSort | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger aria-label="Sort items">
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
