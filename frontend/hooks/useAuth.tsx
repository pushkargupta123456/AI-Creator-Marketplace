'use client';

import { api, tokenStore } from '@/lib/api';
import type { AuthUser, Role } from '@/types';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: { name: string; email: string; password: string; role: Role }) => Promise<AuthUser>;
  logout: () => void;
}

const USER_KEY = 'cre8r.user';
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: AuthUser | null = null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw && tokenStore.get()) stored = JSON.parse(raw);
    } catch {
      /* ignore */
    }
    setUser(stored);
    setReady(true);

    if (!stored) return;

    // A token outlives the data it points at — switching storage backends, or
    // wiping the database, leaves a valid-looking session whose user is gone.
    // Check once on load and clear the session if the account no longer exists.
    let live = true;
    api
      .me()
      .then((fresh) => {
        if (live && fresh) {
          setUser(fresh);
          try {
            window.localStorage.setItem(USER_KEY, JSON.stringify(fresh));
          } catch {
            /* ignore */
          }
        }
      })
      .catch((err) => {
        if (!live) return;
        // Only a rejected identity clears the session; a network blip must not.
        const status = (err as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 404) {
          tokenStore.set(null);
          try {
            window.localStorage.removeItem(USER_KEY);
          } catch {
            /* ignore */
          }
          setUser(null);
        }
      });

    return () => {
      live = false;
    };
  }, []);

  const persist = useCallback((token: string, u: AuthUser) => {
    tokenStore.set(token);
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.login(email, password);
    return persist(token, u);
  }, [persist]);

  const register = useCallback(async (input: { name: string; email: string; password: string; role: Role }) => {
    const { token, user: u } = await api.register(input);
    return persist(token, u);
  }, [persist]);

  const logout = useCallback(() => {
    tokenStore.set(null);
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
