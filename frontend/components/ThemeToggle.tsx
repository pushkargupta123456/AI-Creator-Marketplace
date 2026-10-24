'use client';

import { useTheme, type ThemePreference } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/**
 * Single icon button that flips light/dark. Shows the theme you'd switch
 * *to*, which is the convention users expect from a one-tap control.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        'relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full',
        'text-muted transition-colors hover:bg-raise-2 hover:text-fg',
        className,
      )}
    >
      {/* Both icons are mounted and cross-faded so the swap can't reflow. */}
      <Sun
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300',
          theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
        )}
      />
      <Moon
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300',
          theme === 'dark' ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
    </button>
  );
}

/** Three-way Light / Dark / System control for menus and settings panels. */
export function ThemeSegmented({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn('inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 p-1', className)}
    >
      {OPTIONS.map((o) => {
        const active = preference === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(o.value)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              active ? 'bg-purple text-on-media' : 'text-muted hover:text-fg',
            )}
          >
            <o.icon className="h-3.5 w-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
