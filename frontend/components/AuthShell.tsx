'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { SmartImage } from './SmartImage';

/**
 * Decorative collage for the auth pages. These are fixed art-direction picks
 * rather than live portfolio items, so they're listed here instead of pulling
 * the whole seed dataset into the login and register bundles.
 */
const TILES = [
  'photo-1514565131-fce0801e5785',
  'photo-1634017839464-5c339ebe3cb4',
  'photo-1509347528160-9a9e33742cdb',
  'photo-1536440136628-849c177e76a1',
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`);

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 pt-24 pb-12 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>

      {/* Decorative panel — hidden on anything smaller than a laptop. */}
      <div aria-hidden className="relative hidden overflow-hidden border-l border-line bg-bg-subtle lg:block">
        <div className="absolute inset-0 grid grid-cols-2 gap-3 p-3 pt-20">
          {TILES.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: i % 2 ? 40 : 0 }}
              transition={{ delay: 0.1 * i, duration: 0.8 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <SmartImage src={src} alt="" className="h-full w-full" />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-12">
          <p className="max-w-md text-xl font-semibold tracking-tight text-balance xl:text-2xl">
            “We found our launch-film director in an afternoon. The verification signals made the decision easy.”
          </p>
          <p className="mt-4 text-sm text-muted">Head of Brand, Volt Motors</p>
        </div>
      </div>
    </div>
  );
}
