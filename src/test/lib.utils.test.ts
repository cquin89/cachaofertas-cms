import { describe, it, expect } from 'vitest';
import { cn, slugify, truncate, formatCLP, formatNumber, formatPercent, percentChange } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('resolves Tailwind conflicts — last wins', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false && 'b', undefined, null, 'c')).toBe('a c');
  });
});

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('Política de Privacidad')).toBe('politica-de-privacidad');
  });

  it('removes accents', () => {
    expect(slugify('Ñoño')).toBe('nono');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('¡Oferta! 50% off')).toBe('oferta-50-off');
  });
});

describe('truncate', () => {
  it('returns original when shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('adds ellipsis when truncated', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('returns full string at exact limit', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('formatCLP', () => {
  it('formats Chilean pesos correctly', () => {
    expect(formatCLP(699990)).toContain('699');
    expect(formatCLP(699990)).toContain('990');
  });

  it('handles zero', () => {
    expect(formatCLP(0)).toContain('0');
  });
});

describe('formatNumber', () => {
  it('adds thousands separator', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('handles small numbers', () => {
    expect(formatNumber(42)).toBe('42');
  });
});

describe('formatPercent', () => {
  it('adds + for positive', () => {
    expect(formatPercent(12.5)).toBe('+12.5%');
  });

  it('keeps - for negative', () => {
    expect(formatPercent(-3.2)).toBe('-3.2%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });
});

describe('percentChange', () => {
  it('calculates percentage change correctly', () => {
    expect(percentChange(110, 100)).toBe(10);
  });

  it('handles previous = 0', () => {
    expect(percentChange(50, 0)).toBe(100);
    expect(percentChange(0, 0)).toBe(0);
  });

  it('handles decrease', () => {
    expect(percentChange(80, 100)).toBe(-20);
  });
});
