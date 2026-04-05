import { useState, useCallback } from 'react';
import { Keyboard } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ModerationStats } from './components/ModerationStats';
import { ModerationQueue } from './components/ModerationQueue';
import { useModerationQueue, usePendingCounts, useResolveModeration } from './hooks/useModeration';
import { cn } from '@/lib/utils';
import type { ModerationItemType, ModerationAction } from '@/types/moderation';

const TABS: { id: ModerationItemType; label: string }[] = [
  { id: 'deal',    label: 'Deals Pendientes' },
  { id: 'comment', label: 'Comentarios Reportados' },
  { id: 'user',    label: 'Usuarios Reportados' },
];

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<ModerationItemType>('deal');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const counts = usePendingCounts();
  const { data, isLoading: queueLoading } = useModerationQueue(activeTab, page, LIMIT);
  const { mutate: resolve, isPending: resolving } = useResolveModeration();

  const handleTabChange = (tab: ModerationItemType) => {
    setActiveTab(tab);
    setFocusedIndex(0);
    setPage(0);
  };

  const handleAction = useCallback(
    (id: number, action: ModerationAction, reason?: string) => {
      resolve(
        { id, action, reason },
        {
          onSuccess: () => {
            // Auto-advance to next item after action
            setFocusedIndex((prev) => {
              const total = data?.items.length ?? 0;
              // If the resolved item was removed, keep same index (next item shifts up)
              // Clamp to last available
              return Math.min(prev, Math.max(total - 2, 0));
            });
          },
        }
      );
    },
    [resolve, data?.items.length]
  );

  const totalByTab: Record<ModerationItemType, number> = {
    deal:    counts.deal,
    comment: counts.comment,
    user:    counts.user,
  };

  const hasMore = data ? (page + 1) * LIMIT < data.total : false;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cola de Moderación"
        description="Revisa y gestiona el contenido reportado por los usuarios."
        actions={
          <button
            type="button"
            onClick={() => setShowShortcuts((s) => !s)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
              showShortcuts
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-warm-200 bg-white text-warm-500 hover:border-warm-300'
            )}
            title="Toggle keyboard shortcuts"
          >
            <Keyboard size={13} />
            Atajos de teclado
          </button>
        }
      />

      {/* Stats strip */}
      <ModerationStats
        dealCount={totalByTab.deal}
        commentCount={totalByTab.comment}
        userCount={totalByTab.user}
        loading={false}
      />

      {/* Keyboard shortcuts legend */}
      {showShortcuts && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warm-100 bg-warm-50 px-4 py-2.5 text-xs text-warm-500">
          <span className="font-semibold text-warm-600">Atajos:</span>
          {[
            { key: 'A', label: 'Aprobar' },
            { key: 'R', label: 'Rechazar' },
            { key: 'N', label: 'Siguiente' },
            { key: 'P', label: 'Anterior' },
          ].map(({ key, label }) => (
            <span key={key} className="flex items-center gap-1">
              <kbd className="rounded border border-warm-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-warm-700 shadow-sm">
                {key}
              </kbd>
              <span>{label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-warm-200">
        <nav className="-mb-px flex gap-0.5">
          {TABS.map((tab) => {
            const count = totalByTab[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-warm-500 hover:border-warm-300 hover:text-warm-700'
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold',
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-warm-100 text-warm-500'
                    )}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Queue */}
      <ModerationQueue
        items={data?.items}
        loading={queueLoading}
        resolving={resolving}
        focusedIndex={focusedIndex}
        type={activeTab}
        showShortcuts={showShortcuts}
        onFocusChange={setFocusedIndex}
        onAction={handleAction}
        hasMore={hasMore}
        onLoadMore={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
