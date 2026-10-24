'use client';

import { Badge, VerifiedBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CreatorCard } from '@/components/CreatorCard';
import { EmptyState } from '@/components/EmptyState';
import { CardGridSkeleton, LoadingState } from '@/components/LoadingState';
import { Modal } from '@/components/Modal';
import { Logo } from '@/components/Navbar';
import { PortfolioCard } from '@/components/PortfolioCard';
import { PortfolioModal } from '@/components/PortfolioModal';
import { ProfileSummary, completionPercent, profileChecklist } from '@/components/ProfileSummary';
import { ProfileForm } from '@/components/ProfileForm';
import { SmartImage } from '@/components/SmartImage';
import { StatsCard } from '@/components/StatsCard';
import { ThemeSegmented, ThemeToggle } from '@/components/ThemeToggle';
import { CREATORS } from '@/data/seed';
import { CONTENT_TYPES } from '@/data/taxonomy';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ApiError, api } from '@/lib/api';
import { cn, formatDate, initials } from '@/lib/utils';
import type { ContentType, Creator, PortfolioItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Circle,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

type Tab = 'overview' | 'profile' | 'portfolio' | 'briefs' | 'saved' | 'messages' | 'settings';

type NavItem = { id: Tab; label: string; icon: typeof LayoutGrid };

/**
 * The two roles do different jobs here, so they get different menus:
 * creators manage a public profile and portfolio, brands manage briefs.
 */
const navFor = (isCreator: boolean): NavItem[] =>
  isCreator
    ? [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
        { id: 'briefs', label: 'Browse Briefs', icon: FileText },
        { id: 'saved', label: 'Saved Creators', icon: Bookmark },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    : [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'briefs', label: 'My Briefs', icon: FileText },
        { id: 'saved', label: 'Saved Creators', icon: Bookmark },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];

// NOTE: the Messages tab is still a mock — these threads are not stored
// anywhere and there is no messaging API behind them yet.
const THREADS = [
  { id: 1, creator: CREATORS[0], last: 'Happy to jump on a call tomorrow to walk through the treatment.', time: '12:40', unread: 2 },
  { id: 2, creator: CREATORS[3], last: 'Here is the first character turnaround for Crunch!', time: 'Yesterday', unread: 0 },
  { id: 3, creator: CREATORS[2], last: 'Renders will be ready by Friday.', time: 'Mon', unread: 0 },
];

export default function DashboardPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const briefs = useAsync(() => api.getBriefs(), []);
  const [saved, setSaved] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [thread, setThread] = useState(THREADS[0]);
  const [messages, setMessages] = useState<Record<number, { me: boolean; text: string }[]>>({
    1: [
      { me: false, text: 'Hi! Thanks for the invite to the Volt Motors brief.' },
      { me: true, text: 'Love your Neon Mumbai piece — could you do something similar at dusk?' },
      { me: false, text: 'Happy to jump on a call tomorrow to walk through the treatment.' },
    ],
    2: [{ me: false, text: 'Here is the first character turnaround for Crunch!' }],
    3: [{ me: false, text: 'Renders will be ready by Friday.' }],
  });
  const [draft, setDraft] = useState('');

  const isCreator = user?.role === 'creator';

  // The signed-in user's own creator profile, straight from the API. Previously
  // this was a hardcoded lookup that always resolved to the same demo creator.
  const profile = useAsync(() => (user ? api.getMyCreator() : Promise.resolve(null)), [user?.id]);
  const me = profile.data;

  // Backs the "Saved creators" tab — shortlisted ids live in localStorage, the
  // creator records themselves come from the API.
  const allCreators = useAsync(() => api.getCreators(), []);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem('cre8r.savedCreators') ?? '[]'));
    } catch {
      /* ignore */
    }
  }, []);

  // Own portfolio, keyed to the real profile.
  useEffect(() => {
    if (!me?.id) {
      setPortfolio([]);
      return;
    }
    let live = true;
    api
      .getPortfolio({ creatorId: me.id })
      .then((items) => {
        if (live) setPortfolio(items);
      })
      .catch(() => {
        if (live) setPortfolio([]);
      });
    return () => {
      live = false;
    };
  }, [me?.id]);

  const go = (t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => ({ ...m, [thread.id]: [...(m[thread.id] ?? []), { me: true, text: draft.trim() }] }));
    setDraft('');
  };

  // Fallback signals so the brand view (which has no creator record) still
  // shows what CRE8R verifies.
  const DEFAULT_SIGNALS = [
    { type: 'identity', label: 'Identity Verified', verified: false },
    { type: 'portfolio', label: 'Portfolio Verified', verified: false },
    { type: 'tools', label: 'Tool Experience Verified', verified: false },
    { type: 'workflow', label: 'Workflow Verified', verified: false },
  ];

  const NAV = navFor(isCreator);

  const completeness = me ? completionPercent(profileChecklist(me, portfolio.length)) : 0;
  const signals = me?.verification ?? [];
  const verifiedSignals = signals.filter((v) => v.verified).length;
  const totalSignals = signals.length || 4;

  const myBriefs = briefs.data ?? [];
  const activeBriefs = myBriefs.filter((b) => b.status === 'open').length;
  const applications = myBriefs.reduce((s, b) => s + b.applicants, 0);

  const signOut = () => {
    logout();
    router.push('/');
  };

  const [creatingProfile, setCreatingProfile] = useState(false);

  /**
   * Rebuilds a creator profile for an account that has the creator role but no
   * profile record — e.g. a session issued against the old in-memory storage.
   */
  const recreateProfile = async () => {
    if (!user) return;
    setCreatingProfile(true);
    try {
      const created = await api.createCreator({ name: user.name });
      profile.setData(created);
      toast.success('Profile created', 'You can fill in the details now.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not create your profile';
      // A dead session can't be repaired in place — send them through login.
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        toast.error('Your session has expired', 'Please log in again.');
        signOut();
      } else {
        toast.error('Could not create profile', msg);
      }
    } finally {
      setCreatingProfile(false);
    }
  };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => go(n.id)}
            className={cn(
              'relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
              tab === n.id ? 'text-fg' : 'text-muted hover:bg-raise hover:text-fg',
            )}
          >
            {tab === n.id && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl border border-line bg-raise-2" />}
            <n.icon className="relative h-4 w-4" />
            <span className="relative">{n.label}</span>
            {n.id === 'messages' && <span className="relative ml-auto rounded-full bg-purple px-1.5 text-[10px] font-semibold">2</span>}
          </button>
        ))}
      </nav>
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-xs font-semibold">{initials(user?.name ?? 'Demo User')}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Demo workspace'}</p>
            <p className="truncate text-xs text-muted">{user ? (isCreator ? 'Creator' : 'Brand / Agency') : 'Not signed in'}</p>
          </div>
          {user ? (
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="cursor-pointer text-muted hover:text-fg"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link href="/login" className="text-xs text-purple">
              Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-ink-900 lg:block">{Sidebar}</aside>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute inset-y-0 left-0 w-64 border-r border-line bg-ink-900">
              {Sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button className="cursor-pointer text-muted lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-semibold">{NAV.find((n) => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button href="/creators" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Find creators
            </Button>
            {isCreator ? (
              <Button href="/briefs" size="sm">
                <FileText className="h-4 w-4" /> Find briefs
              </Button>
            ) : (
              <Button href="/briefs/create" size="sm">
                <Plus className="h-4 w-4" /> New brief
              </Button>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {ready && !user && (
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-purple/30 bg-purple/[0.07] p-4 sm:flex-row sm:items-center">
              <p className="text-sm">You&apos;re viewing a demo workspace. Log in to save your activity.</p>
              <Button href="/login" size="sm" variant="outline">
                Log in
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {tab === 'overview' && (
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      Good to see you{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {isCreator
                        ? 'Keep your profile sharp — it is what brands search on.'
                        : 'Here is what is happening across your briefs.'}
                    </p>
                  </div>

                  {/* Creator: own profile front and centre, with what is missing. */}
                  {isCreator &&
                    (profile.loading && !me ? (
                      <div className="surface p-6">
                        <LoadingState label="Loading your profile…" />
                      </div>
                    ) : me ? (
                      <ProfileSummary creator={me} portfolioCount={portfolio.length} onEdit={() => go('profile')} />
                    ) : null)}

                  {/* Only stats this app actually records — no invented numbers. */}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {isCreator ? (
                      <>
                        <StatsCard label="Portfolio pieces" value={String(portfolio.length)} icon={ImageIcon} />
                        <StatsCard label="Profile complete" value={`${completeness}%`} icon={User} />
                        <StatsCard label="Verified signals" value={`${verifiedSignals}/${totalSignals}`} icon={ShieldCheck} />
                        <StatsCard label="Open briefs to apply" value={String(activeBriefs)} icon={FileText} />
                      </>
                    ) : (
                      <>
                        <StatsCard label="Briefs posted" value={String(myBriefs.length)} icon={FileText} />
                        <StatsCard label="Open briefs" value={String(activeBriefs)} icon={Briefcase} />
                        <StatsCard label="Total applicants" value={String(applications)} icon={Users} />
                        <StatsCard label="Saved creators" value={String(saved.length)} icon={Bookmark} />
                      </>
                    )}
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                    <div className="surface p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{isCreator ? 'Your latest work' : 'Your latest briefs'}</h3>
                        <Button variant="ghost" size="sm" onClick={() => go(isCreator ? 'portfolio' : 'briefs')}>
                          View all <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {isCreator ? (
                        portfolio.length === 0 ? (
                          <div className="mt-5 rounded-xl border border-dashed border-line-strong p-6 text-center">
                            <ImageIcon className="mx-auto h-6 w-6 text-subtle" />
                            <p className="mt-3 text-sm font-medium">No work published yet</p>
                            <p className="mt-1 text-xs text-muted">Brands shortlist on portfolio first. Add your best piece.</p>
                            <Button size="sm" className="mt-4" onClick={() => setUploadOpen(true)}>
                              <Upload className="h-4 w-4" /> Upload work
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {portfolio.slice(0, 3).map((p) => (
                              <PortfolioCard key={p.id} item={p} onOpen={setActiveItem} showMeta={false} />
                            ))}
                          </div>
                        )
                      ) : myBriefs.length === 0 ? (
                        <div className="mt-5 rounded-xl border border-dashed border-line-strong p-6 text-center">
                          <FileText className="mx-auto h-6 w-6 text-subtle" />
                          <p className="mt-3 text-sm font-medium">No briefs yet</p>
                          <Button href="/briefs/create" size="sm" className="mt-4">
                            <Plus className="h-4 w-4" /> Post a brief
                          </Button>
                        </div>
                      ) : (
                        <ul className="mt-5 space-y-3">
                          {myBriefs.slice(0, 4).map((b) => (
                            <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{b.title}</p>
                                <p className="truncate text-xs text-muted">
                                  {b.contentType} · {b.budget}
                                </p>
                              </div>
                              <Badge tone={b.status === 'open' ? 'success' : 'default'}>{b.applicants} applied</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="surface p-5 sm:p-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-cyan" />
                        <h3 className="font-semibold">{isCreator ? 'Your verification' : 'What we verify'}</h3>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {isCreator
                          ? 'Verified creators rank higher and get shortlisted more often.'
                          : 'Every creator is checked on these four signals.'}
                      </p>
                      <ul className="mt-5 space-y-3">
                        {(me?.verification ?? DEFAULT_SIGNALS).map((v) => (
                          <li key={v.type} className="flex items-center justify-between gap-3 text-sm">
                            <span className={v.verified ? 'text-fg' : 'text-muted'}>{v.label}</span>
                            {v.verified ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-subtle" />
                            )}
                          </li>
                        ))}
                      </ul>
                      {isCreator && me && !me.verified && (
                        <p className="mt-5 rounded-xl border border-line bg-raise p-3 text-xs text-muted">
                          Verification is reviewed by the CRE8R team once your profile and portfolio are complete.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'profile' && (
                <div className="surface overflow-hidden">
                  {profile.loading && !me ? (
                    <div className="p-6">
                      <LoadingState label="Loading your profile…" />
                    </div>
                  ) : !me ? (
                    <div className="p-6">
                      <EmptyState
                        icon={<User className="h-6 w-6" />}
                        title={
                          !user
                            ? 'Log in to edit your profile'
                            : isCreator
                              ? 'Your creator profile is missing'
                              : 'Brand accounts have no public profile'
                        }
                        description={
                          !user
                            ? 'Sign in with a creator account to manage your public profile.'
                            : isCreator
                              ? // Usually means the session predates the current database — the
                                // token is still valid but its records are gone. Rebuilding the
                                // profile (or signing in again) fixes it.
                                'This account is a creator, but no profile record was found. That can happen if your session is older than the current database. Create it again below, or log out and sign in once more.'
                              : 'Only creators are listed in the marketplace. Brands post briefs and search for talent instead.'
                        }
                        action={
                          !user ? (
                            <Button href="/login">Log in</Button>
                          ) : isCreator ? (
                            <div className="flex flex-wrap justify-center gap-2">
                              <Button onClick={recreateProfile} disabled={creatingProfile}>
                                {creatingProfile && <Loader2 className="h-4 w-4 animate-spin" />} Create my profile
                              </Button>
                              <Button variant="outline" onClick={signOut}>
                                Log out
                              </Button>
                            </div>
                          ) : (
                            <Button href="/briefs/create">Post a brief</Button>
                          )
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="relative h-36">
                        <SmartImage src={me.cover} alt="" className="h-full w-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                      </div>
                      <div className="-mt-12 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div className="flex items-end gap-4">
                            <SmartImage
                              src={me.avatar}
                              alt={me.name}
                              className="relative h-24 w-24 rounded-2xl border-4 border-surface"
                            />
                            <div>
                              <p className="flex items-center gap-1.5 text-xl font-semibold">
                                {me.name} {me.verified && <VerifiedBadge />}
                              </p>
                              <p className="text-sm text-purple">
                                {me.specialization.length ? me.specialization.join(' · ') : 'No specialization set'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8">
                          <ProfileForm creator={me} onSaved={(c: Creator) => profile.setData(c)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === 'portfolio' && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-muted">{portfolio.length} published pieces</p>
                    <Button size="sm" onClick={() => setUploadOpen(true)}>
                      <Upload className="h-4 w-4" /> Upload work
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {portfolio.map((p) => (
                      <PortfolioCard key={p.id} item={p} onOpen={setActiveItem} />
                    ))}
                  </div>
                </div>
              )}

              {tab === 'briefs' && (
                <div className="surface overflow-hidden">
                  {briefs.loading ? (
                    <div className="p-6">
                      <CardGridSkeleton count={2} />
                    </div>
                  ) : myBriefs.length === 0 ? (
                    <EmptyState title="No briefs yet" description="Post your first brief to start receiving applications." action={<Button href="/briefs/create">Create brief</Button>} />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-sm">
                        <thead className="border-b border-line text-left text-xs text-muted">
                          <tr>
                            <th className="px-6 py-3 font-medium">Brief</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Budget</th>
                            <th className="px-6 py-3 font-medium">Deadline</th>
                            <th className="px-6 py-3 font-medium">Applicants</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myBriefs.map((b) => (
                            <tr key={b.id} className="border-b border-line last:border-0 hover:bg-raise">
                              <td className="px-6 py-4">
                                <Link href={`/briefs/${b.id}`} className="font-medium hover:text-purple">
                                  {b.title}
                                </Link>
                                <p className="text-xs text-muted">{b.brandName}</p>
                              </td>
                              <td className="px-6 py-4 text-muted">{b.contentType}</td>
                              <td className="px-6 py-4 text-muted">{b.budget}</td>
                              <td className="px-6 py-4 text-muted">{formatDate(b.deadline)}</td>
                              <td className="px-6 py-4">{b.applicants}</td>
                              <td className="px-6 py-4">
                                <Badge tone="success">Open</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'saved' &&
                (saved.length === 0 ? (
                  <EmptyState
                    icon={<Bookmark className="h-6 w-6" />}
                    title="No saved creators yet"
                    description="Tap the heart on any creator profile to shortlist them here."
                    action={<Button href="/creators">Discover creators</Button>}
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                    {(allCreators.data?.data ?? [])
                      .filter((c) => saved.includes(c.id))
                      .map((c, i) => (
                        <CreatorCard key={c.id} creator={c} index={i} />
                      ))}
                  </div>
                ))}

              {tab === 'messages' && (
                <div className="surface grid h-[600px] overflow-hidden md:grid-cols-[280px_1fr]">
                  <ul className="hidden border-r border-line md:block">
                    {THREADS.map((t) => (
                      <li key={t.id}>
                        <button
                          onClick={() => setThread(t)}
                          className={cn('flex w-full cursor-pointer gap-3 border-b border-line p-4 text-left transition', thread.id === t.id ? 'bg-raise-2' : 'hover:bg-raise')}
                        >
                          <SmartImage src={t.creator.avatar} alt={t.creator.name} className="h-10 w-10 shrink-0 rounded-full" />
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">{t.creator.name}</p>
                              <span className="text-[11px] text-subtle">{t.time}</span>
                            </div>
                            <p className="truncate text-xs text-muted">{(messages[t.id] ?? []).at(-1)?.text ?? t.last}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex min-h-0 flex-col">
                    <div className="flex items-center gap-3 border-b border-line p-4">
                      <SmartImage src={thread.creator.avatar} alt={thread.creator.name} className="h-9 w-9 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{thread.creator.name}</p>
                        <p className="text-xs text-success">Online</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                      {(messages[thread.id] ?? []).map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', m.me ? 'ml-auto bg-purple text-fg' : 'bg-card-2 text-muted')}
                        >
                          {m.text}
                        </motion.div>
                      ))}
                    </div>
                    <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" className="field" />
                      <Button type="submit" aria-label="Send">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {tab === 'settings' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Settings saved');
                  }}
                  className="surface max-w-2xl space-y-6 p-5 sm:p-6"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="settings-name">Name</label>
                      <input id="settings-name" className="field" autoComplete="name" defaultValue={user?.name ?? 'Demo User'} />
                    </div>
                    <div>
                      <label className="label" htmlFor="settings-email">Email</label>
                      <input id="settings-email" className="field" type="email" autoComplete="email" defaultValue={user?.email ?? 'demo@cre8r.dev'} />
                    </div>
                  </div>

                  <div>
                    <p className="label">Appearance</p>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3">
                      <span className="text-sm text-muted">
                        Choose a theme, or follow your device setting.
                      </span>
                      <ThemeSegmented />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="label">Notifications</p>
                    {['New applications on my briefs', 'Messages from creators', 'Weekly creator recommendations'].map((n, i) => (
                      <label key={n} className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-3 text-sm">
                        {n}
                        <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 accent-purple-500" />
                      </label>
                    ))}
                  </div>
                  <Button type="submit">Save settings</Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <PortfolioModal item={activeItem} onClose={() => setActiveItem(null)} creatorName={me?.name} />
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        creatorId={me?.id}
        onAdded={(item) => {
          setPortfolio((p) => [item, ...p]);
          toast.success('Work published', 'Your portfolio has been updated.');
        }}
      />
    </div>
  );
}

/**
 * Publishes a portfolio item through POST /api/portfolios. This used to only
 * push into React state, so "published" work vanished on refresh.
 */
function UploadModal({
  open,
  onClose,
  creatorId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  creatorId?: string;
  onAdded: (p: PortfolioItem) => void;
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ContentType>('Image');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return setError('Title must be at least 3 characters.');
    if (!/^https?:\/\//.test(url)) return setError('Enter a valid media URL (Cloudinary, Unsplash, etc).');
    if (!creatorId) return setError('You need a creator profile before publishing work.');

    setSaving(true);
    setError('');
    try {
      const saved = await api.createPortfolioItem({
        creatorId,
        title: title.trim(),
        mediaUrl: url.trim(),
        thumbnail: url.trim(),
        contentType: type,
      });
      onAdded(saved);
      setTitle('');
      setUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish this item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold">Upload work</h3>
          <p className="text-xs text-muted">Media is stored via Cloudinary when configured; paste a hosted URL for now.</p>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Neon Mumbai — Director's cut" />
        </div>
        <div>
          <label className="label">Media URL</label>
          <input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/…" />
        </div>
        <div>
          <p className="label">Content type</p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setType(c)}
                className={cn('cursor-pointer rounded-full border px-3 py-1.5 text-xs', type === c ? 'border-purple/60 bg-purple/15' : 'border-line text-muted')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit">
            <Upload className="h-4 w-4" /> Publish
          </Button>
        </div>
      </form>
    </Modal>
  );
}
