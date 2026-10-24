'use client';

import { Button } from '@/components/Button';
import { CONTENT_TYPES, SKILL_NAMES, SPECIALIZATIONS, TOOL_NAMES } from '@/data/taxonomy';
import { useToast } from '@/hooks/useToast';
import { api, type CreatorProfileUpdate } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Availability, ContentType, Creator } from '@/types';
import { Check, Loader2, Save } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

const AVAILABILITY: Availability[] = ['Available', 'Limited', 'Booked'];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
        active
          ? 'border-purple/60 bg-purple/12 font-medium text-purple'
          : 'border-line text-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {active && <Check className="h-3 w-3" />}
      {children}
    </button>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

type FormState = Required<
  Pick<
    CreatorProfileUpdate,
    | 'name'
    | 'headline'
    | 'location'
    | 'bio'
    | 'avatar'
    | 'cover'
    | 'specialization'
    | 'skills'
    | 'tools'
    | 'contentTypes'
    | 'experience'
    | 'hourlyRate'
    | 'availability'
    | 'responseTime'
  >
>;

const fromCreator = (c: Creator): FormState => ({
  name: c.name ?? '',
  headline: c.headline ?? '',
  location: c.location ?? '',
  bio: c.bio ?? '',
  avatar: c.avatar ?? '',
  cover: c.cover ?? '',
  specialization: c.specialization ?? [],
  skills: c.skills ?? [],
  tools: c.tools ?? [],
  contentTypes: c.contentTypes ?? [],
  experience: c.experience ?? 0,
  hourlyRate: c.hourlyRate ?? 0,
  availability: c.availability ?? 'Available',
  responseTime: c.responseTime ?? '< 24 hours',
});

/**
 * Edits the signed-in creator's own profile and saves it with
 * PUT /api/creators/:id. Backs onto the real record — nothing here is local.
 */
export function ProfileForm({ creator, onSaved }: { creator: Creator; onSaved: (c: Creator) => void }) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => fromCreator(creator));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  };

  const toggle = <K extends 'specialization' | 'skills' | 'tools' | 'contentTypes'>(key: K, value: string) =>
    setForm((f) => {
      const list = f[key] as string[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [key]: next } as FormState;
    });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      const saved = await api.updateCreator(creator.id, {
        ...form,
        name: form.name.trim(),
        headline: form.headline.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        responseTime: form.responseTime.trim() || '< 24 hours',
        // Blank means "keep the generated placeholder" rather than empty image.
        avatar: form.avatar.trim() || undefined,
        cover: form.cover.trim() || undefined,
        experience: Number(form.experience) || 0,
        hourlyRate: Number(form.hourlyRate) || 0,
        contentTypes: form.contentTypes as ContentType[],
      });
      onSaved(saved);
      toast.success('Profile saved', 'Your public profile has been updated.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save profile';
      setError(msg);
      toast.error('Could not save profile', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Display name">
          <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Location" hint="City, Country">
          <input
            className="field"
            placeholder="Mumbai, India"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Headline" hint="One line brands see first.">
            <input
              className="field"
              placeholder="Cinematic AI films for product launches."
              value={form.headline}
              onChange={(e) => set('headline', e.target.value)}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Bio">
            <textarea
              className="field resize-none"
              rows={4}
              placeholder="How you work, what you're best at, the kind of projects you want."
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <Field label="Specialization">
        <div className="flex flex-wrap gap-1.5">
          {SPECIALIZATIONS.map((s) => (
            <Chip key={s} active={form.specialization.includes(s)} onClick={() => toggle('specialization', s)}>
              {s}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="AI tools you use">
        <div className="flex flex-wrap gap-1.5">
          {TOOL_NAMES.map((t) => (
            <Chip key={t} active={form.tools.includes(t)} onClick={() => toggle('tools', t)}>
              {t}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Skills">
        <div className="flex flex-wrap gap-1.5">
          {SKILL_NAMES.map((s) => (
            <Chip key={s} active={form.skills.includes(s)} onClick={() => toggle('skills', s)}>
              {s}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Content types you deliver">
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((c) => (
            <Chip key={c} active={form.contentTypes.includes(c)} onClick={() => toggle('contentTypes', c)}>
              {c}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Experience (years)">
          <input
            className="field"
            type="number"
            min={0}
            max={60}
            value={form.experience}
            onChange={(e) => set('experience', Number(e.target.value))}
          />
        </Field>
        <Field label="Rate (USD / hr)">
          <input
            className="field"
            type="number"
            min={0}
            value={form.hourlyRate}
            onChange={(e) => set('hourlyRate', Number(e.target.value))}
          />
        </Field>
        <Field label="Availability">
          <select
            className="field cursor-pointer"
            value={form.availability}
            onChange={(e) => set('availability', e.target.value as Availability)}
          >
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Response time">
          <input
            className="field"
            placeholder="< 24 hours"
            value={form.responseTime}
            onChange={(e) => set('responseTime', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Avatar URL" hint="Leave blank to keep the generated one.">
          <input className="field" value={form.avatar} onChange={(e) => set('avatar', e.target.value)} />
        </Field>
        <Field label="Cover image URL">
          <input className="field" value={form.cover} onChange={(e) => set('cover', e.target.value)} />
        </Field>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </Button>
        <Button href={`/creators/${creator.username || creator.id}`} variant="outline">
          View public profile
        </Button>
      </div>
    </form>
  );
}
