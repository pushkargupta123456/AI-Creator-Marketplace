'use client';

import { useAuth } from '@/hooks/useAuth';
import { cn, initials } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import { ThemeSegmented, ThemeToggle } from './ThemeToggle';

const links = [
  { href: '/#trending', label: 'Discover' },
  { href: '/creators', label: 'Creators' },
  { href: '/briefs', label: 'Briefs' },
  { href: '/#how-it-works', label: 'How it works' },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet via-purple to-cyan">
        <span className="h-2.5 w-2.5 rounded-sm bg-bg transition-transform duration-500 group-hover:rotate-45" />
      </span>
      <span className="text-[17px]">
        CRE<span className="text-purple">8</span>R
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Lock background scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (pathname?.startsWith('/dashboard')) return null;

  const isActive = (href: string) => !href.includes('#') && pathname?.startsWith(href);

  const signOut = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || open ? 'border-b border-line bg-bg/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Logo />
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={cn(
                    'rounded-full px-3 py-2 text-sm transition-colors',
                    isActive(l.href) ? 'bg-raise-2 font-medium text-fg' : 'text-muted hover:text-fg',
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Button href="/dashboard" variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
              <div
                className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-xs font-semibold text-white"
                title={user.name}
              >
                {initials(user.name)}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-raise-2 hover:text-fg"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href="/register" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:text-fg"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-bg md:hidden"
          >
            <div className="container-x flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto py-4">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm text-muted transition-colors hover:bg-raise hover:text-fg"
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="text-xs font-medium tracking-wide text-subtle uppercase">Theme</span>
                <ThemeSegmented />
              </div>

              <div className="mt-3 flex gap-2">
                {user ? (
                  <>
                    <Button href="/dashboard" variant="outline" size="sm" className="flex-1">
                      Dashboard
                    </Button>
                    <Button variant="ghost" size="sm" onClick={signOut}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="outline" size="sm" className="flex-1">
                      Log in
                    </Button>
                    <Button href="/register" size="sm" className="flex-1">
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
