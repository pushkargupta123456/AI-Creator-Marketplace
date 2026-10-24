'use client';

import { CONTENT_TYPES, EXPERIENCE_BUCKETS, LOCATIONS, SKILL_NAMES, SPECIALIZATIONS, TOOL_NAMES } from '@/data/taxonomy';
import { cn } from '@/lib/utils';
import type { CreatorFilters } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Check, ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type ArrayKey = 'specialization' | 'skill' | 'tool' | 'contentType' | 'location' | 'experience';

function Group({ title, count, children, defaultOpen = true }: { title: string; count: number; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-3 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="rounded-full bg-purple/15 px-1.5 py-0.5 text-[11px] font-semibold text-purple">{count}</span>
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-subtle transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="group flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 text-left text-sm text-muted transition-colors hover:text-fg"
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
          checked ? 'border-purple bg-purple text-on-media' : 'border-line-strong group-hover:border-purple/50',
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className={cn('break-anywhere', checked && 'font-medium text-fg')}>{label}</span>
    </button>
  );
}

function Chip({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={cn(
        'cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors',
        checked
          ? 'border-purple/60 bg-purple/12 font-medium text-purple'
          : 'border-line text-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {label}
    </button>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
}: {
  filters: CreatorFilters;
  onChange: (f: CreatorFilters) => void;
  onReset: () => void;
}) {
  const toggle = (key: ArrayKey, value: string) => {
    const list = filters[key];
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };
  const activeCount =
    filters.specialization.length +
    filters.skill.length +
    filters.tool.length +
    filters.contentType.length +
    filters.location.length +
    filters.experience.length +
    (filters.verified ? 1 : 0);

  return (
    <aside className="surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 pb-1">
        <p className="font-semibold">Filters</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer rounded-md px-1 text-xs font-medium text-purple transition-colors hover:text-violet"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <Group title="Verification" count={filters.verified ? 1 : 0}>
        <button
          type="button"
          role="switch"
          aria-checked={filters.verified}
          onClick={() => onChange({ ...filters, verified: !filters.verified })}
          className={cn(
            'flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 text-sm transition-colors',
            filters.verified ? 'border-cyan/40 bg-cyan/10 font-medium text-fg' : 'border-line text-muted hover:text-fg',
          )}
        >
          <span className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 shrink-0 text-cyan" /> Verified only
          </span>
          <span
            className={cn(
              'relative h-5 w-9 shrink-0 rounded-full transition-colors',
              filters.verified ? 'bg-cyan' : 'bg-raise-3',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
                filters.verified ? 'left-[18px]' : 'left-0.5',
              )}
            />
          </span>
        </button>
      </Group>

      <Group title="Specialization" count={filters.specialization.length}>
        {SPECIALIZATIONS.map((s) => (
          <CheckRow key={s} label={s} checked={filters.specialization.includes(s)} onClick={() => toggle('specialization', s)} />
        ))}
      </Group>

      <Group title="AI Tools" count={filters.tool.length}>
        <div className="flex flex-wrap gap-1.5">
          {TOOL_NAMES.map((t) => (
            <Chip key={t} label={t} checked={filters.tool.includes(t)} onClick={() => toggle('tool', t)} />
          ))}
        </div>
      </Group>

      <Group title="Content Type" count={filters.contentType.length}>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((c) => (
            <Chip key={c} label={c} checked={filters.contentType.includes(c)} onClick={() => toggle('contentType', c)} />
          ))}
        </div>
      </Group>

      <Group title="Skills" count={filters.skill.length} defaultOpen={false}>
        {SKILL_NAMES.map((s) => (
          <CheckRow key={s} label={s} checked={filters.skill.includes(s)} onClick={() => toggle('skill', s)} />
        ))}
      </Group>

      <Group title="Experience" count={filters.experience.length} defaultOpen={false}>
        {EXPERIENCE_BUCKETS.map((e) => (
          <CheckRow key={e.value} label={e.label} checked={filters.experience.includes(e.value)} onClick={() => toggle('experience', e.value)} />
        ))}
      </Group>

      <Group title="Location" count={filters.location.length} defaultOpen={false}>
        {LOCATIONS.map((l) => (
          <CheckRow key={l} label={l} checked={filters.location.includes(l)} onClick={() => toggle('location', l)} />
        ))}
      </Group>
    </aside>
  );
}
