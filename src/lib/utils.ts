import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/** Combina clases Tailwind sin conflictos */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formatea monto en pesos chilenos: 699990 → "$699.990" */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formatea número con separador de miles: 1234567 → "1.234.567" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-CL').format(n);
}

/** Formatea fecha ISO → "3 de abr, 2026 14:30" */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "d 'de' MMM, yyyy HH:mm", { locale: es });
}

/** Formatea fecha ISO → "3 de abr, 2026" (sin hora) */
export function formatDateShort(date: string | Date): string {
  return format(new Date(date), "d 'de' MMM, yyyy", { locale: es });
}

/** Tiempo relativo: "hace 2 horas" */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

/**
 * Genera slug a partir de texto.
 * "Política de Privacidad" → "politica-de-privacidad"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Trunca texto a N caracteres con elipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/** Genera iniciales para avatar: "Carlos Pérez" → "CP" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Variación porcentual entre dos valores: +12.5% */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Formatea variación como string: "+12.5%" o "-3.2%" */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}
