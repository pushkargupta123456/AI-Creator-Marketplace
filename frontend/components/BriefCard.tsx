'use client';

import { daysUntil, formatDate } from '@/lib/utils';
import type { Brief } from '@/types';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, ShieldCheck, Users } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { contentIcon } from './PortfolioCard';

export function BriefCard({ brief, onApply, index = 0, highlight = false }: { brief: Brief; onApply?: (b: Brief) => void; index?: number; highlight?: boolean }) {
  const Icon = contentIcon[brief.contentType];
  const days = daysUntil(brief.deadline);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className={`surface flex h-full flex-col p-5 transition-colors hover:border-purple/30 sm:p-6 ${highlight ? 'border-purple/50 ring-4 ring-purple/10' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet/25 to-cyan/15 text-sm font-semibold">
            {brief.brandName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-muted">{brief.brandName}</p>
            <h3 className="leading-snug font-semibold text-balance">{brief.title}</h3>
          </div>
        </div>
        <div className="shrink-0">
          {highlight ? (
            <Badge tone="success">New</Badge>
          ) : (
            <Badge tone={days <= 14 ? 'warning' : 'default'}>{days > 0 ? `${days}d left` : 'Closing'}</Badge>
          )}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted">{brief.description}</p>

      <dl className="mt-5 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-purple" />
          <dd className="truncate">{brief.contentType}</dd>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 shrink-0 text-purple" />
          <dd className="truncate">{brief.budget}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-purple" />
          <dd className="truncate">{formatDate(brief.deadline)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-purple" />
          <dd className="truncate">{brief.commercialUse}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {brief.style && <Badge tone="cyan">{brief.style}</Badge>}
        {brief.requiredSkills.slice(0, 3).map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Users className="h-3.5 w-3.5" /> {brief.applicants} applicants
        </span>
        <div className="flex gap-2">
          <Button href={`/briefs/${brief.id}`} variant="outline" size="sm">
            View Brief
          </Button>
          <Button size="sm" onClick={() => onApply?.(brief)}>
            Apply
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
