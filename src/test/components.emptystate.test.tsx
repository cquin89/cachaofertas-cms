import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from './utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { Tag } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items" description="Nothing here yet." />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('renders action button and calls handler', () => {
    const handler = vi.fn();
    render(
      <EmptyState
        title="No deals"
        action={{ label: 'Create', onClick: handler }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('renders with custom icon', () => {
    render(<EmptyState title="No tags" icon={Tag} />);
    expect(screen.getByText('No tags')).toBeInTheDocument();
  });
});
