'use client';

import { Button } from '@/components/Button';
import { VerifiedBadge } from '@/components/Badge';
import { SmartImage } from '@/components/SmartImage';
import { cn } from '@/lib/utils';
import type { Creator } from '@/types';
import { ArrowRight, CheckCircle2, Circle, MapPin } from 'lucide-react';

interface Check {
  label: string;
  done: boolean;
}

/** Which parts of a public profile are filled in, and what's still missing. */
export function profileChecklist(creator: Creator, portfolioCount: number): Check[] {
  return [
    { label: 'Headline', done: Boolean(creator.headline?.trim()) },
    { label: 'Bio', done: Boolean(creator.bio?.trim()) },
    { label: 'Location', done: Boolean(creator.location?.trim()) },
    { label: 'Specialization', done: (creator.specialization ?? []).length > 0 },
    { label: 'Skills', done: (creator.skills ?? []).length > 0 },
    { label: 'AI tools', done: (creator.tools ?? []).length > 0 },
    { label: 'Content types', done: (creator.contentTypes ?? []).length > 0 },
    { label: 'Rate set', done: (creator.hourlyRate ?? 0) > 0 },
    { label: 'Portfolio work', done: portfolioCount > 0 },
  ];
}

export const completionPercent = (checks: Check[]) =>
  Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

/**
 * Overview card for a creator's own profile: who they are, how complete the
 * public listing is, and the quickest route to finishing it.
 */
export function ProfileSummary({
  creator,
  portfolioCount,
  onEdit,
}: {
  creator: Creator;
  portfolioCount: number;
  onEdit: () => void;
}) {
  const checks = profileChecklist(creator, portfolioCount);
  const percent = completionPercent(checks);
  const missing = checks.filter((c) => !c.done);

  return (
    <div className="surface overflow-hidden">
      <div className="relative h-24 sm:h-28">
        <SmartImage src={creator.cover} alt="" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div className="-mt-10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <SmartImage
              src={creator.avatar}
              alt={creator.name}
              className="h-20 w-20 shrink-0 rounded-2xl border-4 border-surface"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-lg font-semibold">
                <span className="truncate">{creator.name}</span>
                {creator.verified && <VerifiedBadge className="shrink-0" />}
              </p>
              <p className="truncate text-sm text-purple">
                {creator.specialization?.length ? creator.specialization.join(' · ') : 'Add your specialization'}
              </p>
              {creator.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <MapPin className="h-3 w-3" /> {creator.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button size="sm" onClick={onEdit}>
              Edit profile
            </Button>
            <Button href={`/creators/${creator.username || creator.id}`} variant="outline" size="sm">
              View public <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Completion */}
        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm font-medium">Profile completeness</p>
            <p className={cn('text-sm font-semibold', percent === 100 ? 'text-success' : 'text-fg')}>{percent}%</p>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-raise-2"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completeness"
          >
            <div
              className={cn('h-full rounded-full transition-all duration-700', percent === 100 ? 'bg-success' : 'bg-purple')}
              style={{ width: `${percent}%` }}
            />
          </div>

          {missing.length > 0 ? (
            <>
              <p className="mt-3 text-xs text-muted">
                Brands filter on these — {missing.length} still to add:
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {checks.map((c) => (
                  <li
                    key={c.label}
                    className={cn('flex items-center gap-1.5 text-xs', c.done ? 'text-subtle' : 'text-fg')}
                  >
                    {c.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-subtle" />
                    )}
                    {c.label}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Your profile is complete and discoverable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
