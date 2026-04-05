import { describe, it, expect } from 'vitest';
import { render, screen } from './utils';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies success variant classes', () => {
    render(<Badge variant="success">OK</Badge>);
    const el = screen.getByText('OK');
    expect(el.className).toMatch(/success/);
  });

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Error</Badge>);
    const el = screen.getByText('Error');
    expect(el.className).toMatch(/danger/);
  });

  it('applies default variant when no variant prop', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });
});
