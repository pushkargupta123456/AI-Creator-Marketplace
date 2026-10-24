import type {
  AuthUser,
  Availability,
  Brief,
  ContentType,
  Creator,
  CreatorFilters,
  PortfolioItem,
  Role,
  Skill,
  Tool,
  WorkflowStep,
} from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/**
 * NEXT_PUBLIC_* values are inlined at build time. Shipping a build that points
 * at localhost means every visitor's browser calls *their own* machine, which
 * always fails — so say so loudly instead of leaving a silent dead API.
 */
if (typeof window !== 'undefined') {
  const apiIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(API_URL);
  const pageIsLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  if (apiIsLocal && !pageIsLocal) {
    console.error(
      `[CRE8R] This build points at ${API_URL}, but the page is served from ${window.location.origin}. ` +
        'NEXT_PUBLIC_API_URL is baked in at build time — rebuild with the deployed API URL.',
    );
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * The server could not be reached at all (network down, backend not running,
 * request timed out). Reported as a real error with status 0 — the app used to
 * substitute bundled demo data here, which made an outage look like success:
 * registration appeared to work while nothing was saved anywhere.
 */
export class OfflineError extends ApiError {
  constructor() {
    super("Can't reach the server. Check that the backend is running, then try again.", 0);
  }
}

const TOKEN_KEY = 'cre8r.token';

const safeStorage = {
  get(key: string) {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
};

export const tokenStore = {
  get: () => safeStorage.get(TOKEN_KEY),
  set: (t: string | null) => safeStorage.set(TOKEN_KEY, t),
};

/** Generous enough to survive a cold start on a sleeping free-tier host. */
const REQUEST_TIMEOUT_MS = 15000;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new OfflineError();
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message;
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(message, res.status);
  }

  // 204 and empty bodies would blow up res.json().
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const toQuery = (f: Record<string, unknown>) => {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      if (v.length) p.set(k, v.join(','));
    } else if (typeof v === 'boolean') {
      if (v) p.set(k, 'true');
    } else if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

/** Fields a creator may change on their own profile. */
export interface CreatorProfileUpdate {
  name?: string;
  username?: string;
  avatar?: string;
  cover?: string;
  headline?: string;
  bio?: string;
  location?: string;
  specialization?: string[];
  focusAreas?: string[];
  skills?: string[];
  tools?: string[];
  contentTypes?: ContentType[];
  experience?: number;
  hourlyRate?: number;
  availability?: Availability;
  responseTime?: string;
  workflow?: WorkflowStep[];
}

export interface NewPortfolioItem {
  creatorId?: string;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnail?: string;
  contentType: ContentType;
  tools?: string[];
  tags?: string[];
}

export const api = {
  health: () => request<{ status: string; db: string }>('/health'),

  // ---------- creators ----------
  getCreators: (f: Partial<CreatorFilters> & { limit?: number; featured?: boolean } = {}) =>
    request<{ data: Creator[]; total: number }>(`/creators${toQuery(f)}`),

  getCreator: (id: string) => request<Creator>(`/creators/${encodeURIComponent(id)}`),

  /** The signed-in user's own profile, or null when they have none. */
  getMyCreator: () => request<Creator | null>('/creators/me'),

  /**
   * Creates the signed-in user's creator profile. Normally registration does
   * this, but it also recovers a creator account whose record is missing.
   */
  createCreator: (input: { name: string } & CreatorProfileUpdate) =>
    request<Creator>('/creators', { method: 'POST', body: JSON.stringify(input) }),

  updateCreator: (id: string, patch: CreatorProfileUpdate) =>
    request<Creator>(`/creators/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  // ---------- portfolio ----------
  getPortfolio: (params: { creatorId?: string; limit?: number } = {}) =>
    request<PortfolioItem[]>(`/portfolios${toQuery(params)}`),

  createPortfolioItem: (input: NewPortfolioItem) =>
    request<PortfolioItem>('/portfolios', { method: 'POST', body: JSON.stringify(input) }),

  // ---------- briefs ----------
  getBriefs: () => request<Brief[]>('/briefs'),

  getBrief: (id: string) => request<Brief>(`/briefs/${encodeURIComponent(id)}`),

  createBrief: (input: Omit<Brief, 'id' | 'applicants' | 'status' | 'createdAt'>) =>
    request<Brief>('/briefs', { method: 'POST', body: JSON.stringify(input) }),

  applyToBrief: (id: string) =>
    request<Brief>(`/briefs/${encodeURIComponent(id)}/apply`, { method: 'POST' }),

  // ---------- reference data ----------
  getSkills: () => request<Skill[]>('/skills'),
  getTools: () => request<Tool[]>('/tools'),

  // ---------- auth ----------
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (input: { name: string; email: string; password: string; role: Role }) =>
    request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  me: () => request<AuthUser>('/auth/me'),

  uploadStatus: () => request<{ cloudinary: boolean }>('/uploads/status'),
};
