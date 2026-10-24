'use client';

import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search creators, skills or tools...',
  className,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cn('group relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-subtle transition-colors group-focus-within:text-purple sm:left-5" />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        type="search"
        className="h-12 w-full rounded-xl border border-line bg-surface pr-11 pl-11 text-[15px] text-fg outline-none transition placeholder:text-subtle focus:border-purple/50 sm:h-14 sm:rounded-2xl sm:pr-12 sm:pl-14"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-subtle transition-colors hover:bg-raise-2 hover:text-fg sm:right-4"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
