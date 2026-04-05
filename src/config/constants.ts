/** Constantes globales del CMS */

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE:    25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const DEBOUNCE_MS = 300;

export const UPLOAD_LIMITS = {
  MAX_SIZE_MB:   5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const;

export const TEMPERATURE_THRESHOLDS = {
  HOT:  300,
  WARM: 100,
  COLD: 0,
} as const;

export const TOAST_DURATION = {
  DEFAULT: 4000,
  SUCCESS: 3000,
  ERROR:   6000,
  UNDO:    5000,  // Para acciones con undo
} as const;

export const FAQ_CATEGORIES = [
  'general',
  'cuenta',
  'ofertas',
  'cupones',
  'pagos',
  'privacidad',
  'técnico',
] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];
