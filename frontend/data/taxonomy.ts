/*
 * Small, stable vocabulary lists used to build filter UI and form pickers.
 *
 * These live apart from `seed.ts` on purpose: importing a filter list should
 * not drag the full creator/portfolio/brief dataset into the bundle. Anything
 * that only needs options (FilterSidebar, the brief form, type pickers) should
 * import from here. `seed.ts` re-exports these so existing imports keep working.
 */

export type ContentType = 'Video' | 'Image' | 'Animation' | '3D' | 'Motion Graphics';
export type Availability = 'Available' | 'Limited' | 'Booked';

export const SPECIALIZATIONS = [
  'AI Filmmaker',
  'AI Animator',
  'AI Designer',
  'Generative Artist',
  '3D Artist',
  'Motion Designer',
];

export const CONTENT_TYPES: ContentType[] = ['Video', 'Image', 'Animation', '3D', 'Motion Graphics'];

/**
 * Markets we list creators in. Kept static rather than derived from the seed
 * data so the filter sidebar stays independent of the dataset — add a market
 * here when creators start appearing in it.
 */
export const LOCATIONS = [
  'Bengaluru, India',
  'Berlin, Germany',
  'Dubai, UAE',
  'Lagos, Nigeria',
  'London, UK',
  'Mumbai, India',
  'New Delhi, India',
  'New York, USA',
  'Paris, France',
  'Seoul, South Korea',
  'São Paulo, Brazil',
  'Tokyo, Japan',
];

export const EXPERIENCE_BUCKETS = [
  { value: '0-2', label: '0–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '6-9', label: '6–9 years' },
  { value: '10+', label: '10+ years' },
];

/**
 * Filterable tool and skill names. The richer `Tool`/`Skill` records (with
 * category and description, shown on creator profiles) stay in `seed.ts`;
 * these are just the vocabulary the filter UI and brief form offer, so those
 * screens don't need the full dataset.
 */
export const TOOL_NAMES = [
  'Midjourney',
  'Runway',
  'Sora',
  'Kling',
  'Stable Diffusion',
  'Flux',
  'Blender',
  'ComfyUI',
  'Pika',
  'ElevenLabs',
];

export const SKILL_NAMES = [
  'Cinematic Storytelling',
  'Prompt Engineering',
  'Color Grading',
  'Video Editing',
  'Character Design',
  'Product Visualization',
  'Fashion Editorial',
  '3D Modeling',
  'Compositing',
  'Sound Design',
  'Storyboarding',
  'Brand Identity',
  'Lighting & Rendering',
  'Worldbuilding',
  'Upscaling & Retouching',
  'LoRA Training',
];
