'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { THEME_KEY, type ResolvedTheme, type ThemePreference } from '@/lib/theme';

export { THEME_KEY };
export type { ResolvedTheme, ThemePreference };

interface ThemeState {
  /** The stored preference, including `system`. */
  preference: ThemePreference;
  /** The theme currently applied. */
  theme: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
  /** Flips between light and dark, leaving `system` behind. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

const isPreference = (v: unknown): v is ThemePreference => v === 'light' || v === 'dark' || v === 'system';

const readStored = (): ThemePreference => {
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return isPreference(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
};

const deviceTheme = (): ResolvedTheme =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server render and first client render must agree, so both start at the
  // documented default. The effect below adopts the real value immediately,
  // and the inline script in layout.tsx has already painted the right colours.
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [device, setDevice] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    setPreferenceState(readStored());
    setDevice(deviceTheme());

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setDevice(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme: ResolvedTheme = preference === 'system' ? device : preference;

  // Keep <html data-theme> in sync so the CSS variables follow.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      if (p === 'system') window.localStorage.removeItem(THEME_KEY);
      else window.localStorage.setItem(THEME_KEY, p);
    } catch {
      /* storage unavailable — the in-memory preference still applies */
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setPreference]);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggle }),
    [preference, theme, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
