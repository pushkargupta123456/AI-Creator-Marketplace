import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function StatsCard({
  label,
  value,
  delta,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  className?: string;
}) {
  const positive = delta?.startsWith('+');
  return (
    <div className={cn('surface p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{label}</p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-raise">
          <Icon className="h-4 w-4 text-purple" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight sm:mt-4 sm:text-3xl">{value}</p>
      {delta && (
        <p className={cn('mt-1 text-xs', positive ? 'text-success' : 'text-muted')}>
          {delta} <span className="text-subtle">vs last 30 days</span>
        </p>
      )}
    </div>
  );
}
