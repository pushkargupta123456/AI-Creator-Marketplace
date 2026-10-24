import { cn } from '@/lib/utils';
import { BadgeCheck } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'default' | 'violet' | 'cyan' | 'success' | 'warning' | 'media';

const tones: Record<Tone, string> = {
  default: 'border-line bg-raise text-muted',
  violet: 'border-purple/25 bg-purple/10 text-purple',
  cyan: 'border-cyan/25 bg-cyan/10 text-cyan',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warn/25 bg-warn/10 text-warn',
  // For badges sitting on top of imagery, where the backdrop is dark in
  // both themes and the label must stay light.
  media: 'border-white/15 bg-black/45 text-on-media backdrop-blur',
};

export function Badge({ children, tone = 'default', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ className, label = false }: { className?: string; label?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-cyan', className)} title="Verified creator">
      <BadgeCheck className="h-4 w-4 fill-cyan/15" />
      {label && <span className="text-xs font-medium">Verified</span>}
    </span>
  );
}
