'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const variants: Record<Variant, string> = {
  // Hover shifts brightness rather than swapping to another token, so white
  // label text keeps its contrast in both themes.
  primary: 'bg-violet text-white shadow-sm hover:brightness-115',
  secondary: 'bg-fg text-bg hover:opacity-90',
  outline: 'border border-line-strong bg-surface text-fg hover:border-purple/40 hover:bg-raise',
  ghost: 'text-muted hover:bg-raise-2 hover:text-fg',
  danger: 'bg-danger text-white hover:opacity-90',
};

// Min-heights keep every size at or above the 44px comfortable tap target
// on touch devices while staying visually compact on desktop.
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

/**
 * Renders a <button>, or a next/link <a> when `href` is given. Both branches
 * forward their remaining props, so onClick, target and aria attributes
 * behave as expected in either form.
 */
type ButtonProps = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };
type LinkProps = Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, type, ...rest } = props;
  return (
    // Default to "button" so a Button inside a <form> can't submit it by
    // accident; callers that want submission pass type="submit".
    <button type={type ?? 'button'} className={cls} {...rest}>
      {children}
    </button>
  );
}
