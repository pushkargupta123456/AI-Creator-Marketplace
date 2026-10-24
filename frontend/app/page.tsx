'use client';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CreatorCard } from '@/components/CreatorCard';
import { HeroBackground } from '@/components/HeroBackground';
import { CardGridSkeleton, ErrorState } from '@/components/LoadingState';
import { contentIcon } from '@/components/PortfolioCard';
import { PortfolioModal } from '@/components/PortfolioModal';
import { SectionHeader } from '@/components/SectionHeader';
import { SmartImage } from '@/components/SmartImage';
import { CREATORS, PORTFOLIO } from '@/data/seed';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/lib/api';
import type { PortfolioItem } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, FileText, Rocket, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** Curated editorial selection for the trending mosaic. */
const TRENDING: { id: string; label: string; span: string }[] = [
  { id: 'p1', label: 'AI Video', span: 'sm:col-span-2 sm:row-span-2' },
  { id: 'p10', label: 'AI Animation', span: '' },
  { id: 'p8', label: 'Product Visual', span: '' },
  { id: 'p4', label: 'Fashion Campaign', span: 'sm:row-span-2' },
  { id: 'p19', label: 'Cinematic Artwork', span: '' },
  { id: 'p7', label: '3D Design', span: '' },
];

const STEPS = [
  { icon: FileText, title: 'Create a Brief', text: 'Describe your project, format, usage rights and budget in a structured creative brief.' },
  { icon: Search, title: 'Discover Creators', text: 'Filter by specialization, AI tools and verified workflows to find the perfect match.' },
  { icon: Rocket, title: 'Start Creating', text: 'Invite creators, review proposals and launch production with full commercial clarity.' },
];

const STATS = [
  ['2,400+', 'Verified AI creators'],
  ['18k', 'Projects delivered'],
  ['4.9/5', 'Average rating'],
  ['< 4h', 'Median response'],
];

const SIGNALS = ['Portfolio Verified', 'Tool Experience Verified', 'Workflow Verified', 'Commercial rights clarity'];

export default function HomePage() {
  const featured = useAsync(() => api.getCreators({ featured: true, limit: 6 }), []);
  const [active, setActive] = useState<PortfolioItem | null>(null);

  // Resolve the curated ids once, dropping any that no longer exist so a
  // change to the dataset can't take the whole page down.
  const trending = useMemo(
    () =>
      TRENDING.flatMap((t) => {
        const item = PORTFOLIO.find((p) => p.id === t.id);
        return item ? [{ ...t, item }] : [];
      }),
    [],
  );

  const creatorName = (id: string) => CREATORS.find((c) => c.id === id)?.name;

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden pt-16">
        <HeroBackground />
        <div className="container-x relative z-10 py-16 text-center sm:py-24">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="flex justify-center">
            <Badge tone="violet" className="px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" /> The marketplace for AI-native creatives
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-4xl text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:mt-7 sm:text-5xl lg:text-[68px]"
          >
            Find the creators shaping the <span className="text-gradient">future of content.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto mt-5 max-w-xl text-base text-muted sm:mt-6 sm:text-lg"
          >
            Discover AI-native filmmakers, animators, designers and creative professionals.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row"
          >
            <Button href="/creators" size="lg">
              Explore Creators <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/briefs/create" variant="outline" size="lg">
              Post a Brief
            </Button>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:mt-16 sm:flex-row"
          >
            <div className="flex -space-x-3">
              {CREATORS.slice(0, 5).map((c) => (
                <SmartImage
                  key={c.id}
                  src={c.avatar}
                  alt=""
                  priority
                  className="h-9 w-9 rounded-full border-2 border-bg"
                />
              ))}
            </div>
            <p className="text-sm text-muted sm:text-left">
              <span className="font-medium text-fg">2,400+ verified creators</span>
              <br className="hidden sm:block" /> using Runway, Sora, Kling, Midjourney &amp; more
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}
      <section className="border-y border-line bg-bg-subtle">
        <div className="container-x grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {STATS.map(([v, l], i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{v}</p>
              <p className="mt-1 text-sm text-muted">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- Featured creators ---------------- */}
      <section className="container-x section-y">
        <SectionHeader
          eyebrow="Featured creators"
          title="Hand-picked, verified talent"
          description="Every featured creator has a verified portfolio, proven tool experience and a documented workflow."
          action={
            <Button href="/creators" variant="outline" size="sm">
              View all creators <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
        {featured.loading && !featured.data && <CardGridSkeleton count={6} />}
        {featured.error && <ErrorState message={featured.error} onRetry={featured.reload} />}
        {featured.data && (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {featured.data.data.map((c, i) => (
              <CreatorCard key={c.id} creator={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Trending work ---------------- */}
      <section id="trending" className="section-y scroll-mt-20 border-t border-line bg-bg-subtle">
        <div className="container-x">
          <SectionHeader
            eyebrow="Trending work"
            title="What AI creators are making now"
            description="From cinematic launch films to photoreal product campaigns."
          />
          <div className="grid auto-rows-[200px] grid-cols-1 gap-3 sm:auto-rows-[220px] sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
            {trending.map(({ id, label, span, item }, i) => {
              const Icon = contentIcon[item.contentType];
              return (
                <motion.button
                  key={id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  onClick={() => setActive(item)}
                  aria-label={`Open ${item.title}`}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-line text-left ${span}`}
                >
                  <SmartImage
                    src={item.thumbnail}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge tone="media">
                      <Icon className="h-3 w-3" /> {label}
                    </Badge>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-on-media sm:text-lg">{item.title}</p>
                      <p className="truncate text-xs text-on-media-muted">by {creatorName(item.creatorId)}</p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how-it-works" className="container-x section-y scroll-mt-20">
        <SectionHeader
          eyebrow="How it works"
          title="From brief to final cut in three steps"
          className="md:justify-center md:text-center [&>div]:mx-auto"
        />
        <div className="relative grid gap-4 sm:gap-5 md:grid-cols-3">
          <div className="absolute top-10 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-purple/40 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="surface relative p-6 text-center sm:p-7"
            >
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple/25 bg-purple/10">
                <s.icon className="h-6 w-6 text-purple" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-fg text-xs font-semibold text-bg">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold sm:mt-6">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </motion.div>
          ))}
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted sm:gap-x-8">
          {SIGNALS.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 shrink-0 text-cyan" /> {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="container-x pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface relative overflow-hidden rounded-3xl px-5 py-14 text-center sm:px-6 sm:py-20"
        >
          <div className="grid-bg absolute inset-0" />
          <div className="glow absolute top-1/2 left-1/2 h-[300px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet blur-[110px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Your next creative partner is already here.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base">
              Browse verified AI creators or post a brief and let the talent come to you.
            </p>
            <div className="mt-8 inline-block sm:mt-9">
              <Button href="/creators" size="lg">
                Explore Creators <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <PortfolioModal item={active} onClose={() => setActive(null)} creatorName={active ? creatorName(active.creatorId) : undefined} />
    </>
  );
}
