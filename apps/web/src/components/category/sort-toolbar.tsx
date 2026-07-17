'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { ItemSort } from '@bucketboard/shared';

const SORT_OPTIONS: Array<{ value: ItemSort; label: string }> = [
  { value: 'top_all', label: 'Top (all time)' },
  { value: 'top_month', label: 'Top (this month)' },
  { value: 'top_week', label: 'Top (this week)' },
  { value: 'new', label: 'New' },
];

export function SortToolbar({ currentSort }: { currentSort: ItemSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort</span>
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="border-input bg-background h-8 rounded-md border px-2 text-sm"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
