import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-purple uppercase">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
