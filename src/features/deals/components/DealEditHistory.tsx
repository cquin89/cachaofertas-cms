import { Clock, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { timeAgo } from '@/lib/utils';
import type { AuditLogEntry } from '@/types/analytics';

interface DealEditHistoryProps {
  items: AuditLogEntry[] | undefined;
  loading: boolean;
}

export function DealEditHistory({ items, loading }: DealEditHistoryProps) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white shadow-sm">
      <div className="border-b border-warm-100 px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-warm-800">
          Historial de cambios
        </h3>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="mt-0.5 h-6 w-6 shrink-0" rounded="full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            title="Sin historial"
            description="No se registraron cambios para esta oferta."
            icon={Clock}
            className="py-8"
          />
        ) : (
          <ol className="relative ml-3 border-l border-warm-200">
            {items.map((item, idx) => (
              <li key={item.id} className={`mb-6 ml-5 ${idx === items.length - 1 ? 'mb-0' : ''}`}>
                {/* Dot */}
                <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-warm-200">
                  <Clock size={10} className="text-warm-500" />
                </span>

                <div className="rounded-lg border border-warm-100 bg-warm-50 p-3">
                  <p className="text-sm font-medium text-warm-800">
                    {ACTION_LABEL[item.action] ?? item.action}
                  </p>

                  <div className="mt-1.5 flex items-center gap-3 text-xs text-warm-400">
                    <span className="flex items-center gap-1">
                      <User size={10} />
                      {item.userUsername}
                    </span>
                    <span>{timeAgo(item.createdAt)}</span>
                  </div>

                  {/* Cambios old/new en JSON diff simplificado */}
                  {item.oldData && item.newData && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <DiffBlock label="Antes" data={item.oldData} color="danger" />
                      <DiffBlock label="Después" data={item.newData} color="success" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function DiffBlock({
  label, data, color,
}: { label: string; data: Record<string, unknown>; color: 'danger' | 'success' }) {
  const borderCls = color === 'danger' ? 'border-danger-200 bg-danger-50' : 'border-success-200 bg-success-50';
  const labelCls = color === 'danger' ? 'text-danger-600' : 'text-success-700';

  return (
    <div className={`rounded-md border p-2 ${borderCls}`}>
      <p className={`mb-1 text-xs font-semibold ${labelCls}`}>{label}</p>
      <pre className="overflow-x-auto font-mono text-xs text-warm-600 whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

const ACTION_LABEL: Record<string, string> = {
  deal_created:        'Oferta creada',
  deal_updated:        'Oferta editada',
  deal_status_changed: 'Estado cambiado',
  deal_featured:       'Destacada / quitada de destacados',
  deal_deleted:        'Oferta eliminada',
  deal_restored:       'Oferta restaurada',
};
