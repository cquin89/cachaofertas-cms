import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { ModerationCard } from './ModerationCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { CheckCircle } from 'lucide-react';
import type { ModerationItem, ModerationAction, ModerationItemType } from '@/types/moderation';

interface ModerationQueueProps {
  items: ModerationItem[] | undefined;
  loading: boolean;
  resolving: boolean;
  focusedIndex: number;
  type: ModerationItemType;
  showShortcuts: boolean;
  onFocusChange: (index: number) => void;
  onAction: (id: number, action: ModerationAction, reason?: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ModerationQueue({
  items,
  loading,
  resolving,
  focusedIndex,
  type,
  showShortcuts,
  onFocusChange,
  onAction,
  onLoadMore,
  hasMore,
}: ModerationQueueProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll focused card into view
  useEffect(() => {
    const card = cardRefs.current[focusedIndex];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when focus is inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (!items || items.length === 0) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          onFocusChange(Math.min(focusedIndex + 1, items.length - 1));
          break;
        case 'p':
          e.preventDefault();
          onFocusChange(Math.max(focusedIndex - 1, 0));
          break;
        case 'a': {
          e.preventDefault();
          const current = items[focusedIndex];
          if (current) onAction(current.id, 'approve');
          break;
        }
        case 'r': {
          e.preventDefault();
          const current = items[focusedIndex];
          if (current) onAction(current.id, 'reject');
          break;
        }
      }
    },
    [items, focusedIndex, onFocusChange, onAction]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-3 w-3" rounded="full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16" rounded="full" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-4 w-3/4 mb-1.5" />
            <Skeleton className="h-3 w-1/2" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-8 w-24" rounded="md" />
              <Skeleton className="h-8 w-20" rounded="md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="Cola vacía"
        description={`No hay ${TYPE_LABEL[type] ?? 'items'} pendientes de moderación.`}
        icon={CheckCircle}
        className="py-16"
      />
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div
          key={item.id}
          ref={(el) => { cardRefs.current[idx] = el; }}
        >
          <ModerationCard
            item={item}
            isFocused={idx === focusedIndex}
            isLoading={resolving}
            onFocus={() => onFocusChange(idx)}
            onAction={onAction}
            showShortcuts={showShortcuts}
          />
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Cargando…
              </>
            ) : (
              'Cargar más'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

const TYPE_LABEL: Record<ModerationItemType, string> = {
  deal: 'ofertas',
  comment: 'comentarios',
  user: 'usuarios',
};
