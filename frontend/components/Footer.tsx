'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Navbar';
import { ThemeSegmented } from './ThemeToggle';

const cols = [
  { title: 'Marketplace', links: [['Find creators', '/creators'], ['Browse briefs', '/briefs'], ['Post a brief', '/briefs/create']] },
  { title: 'For creators', links: [['Join as creator', '/register'], ['Dashboard', '/dashboard'], ['Verification', '/#how-it-works']] },
  { title: 'Company', links: [['How it works', '/#how-it-works'], ['Log in', '/login'], ['Get started', '/register']] },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/dashboard')) return null;
  return (
    <footer className="border-t border-line bg-bg-subtle">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 sm:gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)] md:py-14">
        <div className="sm:col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            The marketplace for AI-native filmmakers, animators, designers and creative professionals.
          </p>
          <ThemeSegmented className="mt-6" />
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="mb-4 text-sm font-medium">{c.title}</p>
            <ul className="space-y-1">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="flex min-h-9 items-center text-sm text-muted transition-colors hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x flex flex-col justify-between gap-2 border-t border-line py-6 text-xs text-subtle sm:flex-row">
        <p>© 2026 CRE8R Labs. All rights reserved.</p>
        <p>Built for the next generation of creative work.</p>
      </div>
    </footer>
  );
}
