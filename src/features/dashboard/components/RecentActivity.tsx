import { Tag, Users, Scale, Settings, FileText, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { timeAgo } from '@/lib/utils';
import type { AuditLogEntry } from '@/types/analytics';

interface RecentActivityProps {
  items: AuditLogEntry[] | undefined;
  loading: boolean;
  error: boolean;
}

const ACTION_CONFIG: Record<string, { icon: typeof Tag; color: string; label: string }> = {
  deal_status_changed:  { icon: Tag,        color: 'text-primary-500 bg-primary-50',  label: 'Oferta actualizada' },
  user_banned:          { icon: ShieldAlert, color: 'text-danger-500 bg-danger-50',    label: 'Usuario baneado' },
  user_unbanned:        { icon: Users,      color: 'text-success-500 bg-success-50',  label: 'Ban levantado' },
  moderation_resolved:  { icon: Scale,      color: 'text-info-500 bg-info-50',        label: 'Moderación resuelta' },
  page_published:       { icon: FileText,   color: 'text-success-500 bg-success-50',  label: 'Página publicada' },
  settings_changed:     { icon: Settings,   color: 'text-warm-500 bg-warm-100',       label: 'Config actualizada' },
};

const DEFAULT_CONFIG = { icon: Settings, color: 'text-warm-400 bg-warm-100', label: 'Acción' };

export function RecentActivity({ items, loading, error }: RecentActivityProps) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white shadow-sm">
      <div className="border-b border-warm-100 px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-warm-800">
          Actividad reciente
        </h3>
        <p className="text-xs text-warm-400">Últimas acciones del equipo</p>
      </div>

      <div className="divide-y divide-warm-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3">
              <Skeleton className="mt-0.5 h-7 w-7 shrink-0" rounded="full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : error || !items || items.length === 0 ? (
          <EmptyState
            title="Sin actividad reciente"
            description={error ? 'No se pudo cargar la actividad.' : 'No hay acciones recientes del equipo.'}
            className="py-10"
          />
        ) : (
          items.map((item) => {
            const config = ACTION_CONFIG[item.action] ?? DEFAULT_CONFIG;
            const Icon = config.icon;

            return (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-warm-50">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.color}`}>
                  <Icon size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-warm-800">
                    <span className="font-medium">{item.userUsername}</span>
                    {' · '}
                    <span className="text-warm-500">{config.label}</span>
                    {item.entityType && (
                      <span className="ml-1 font-mono text-xs text-warm-400">
                        [{item.entityType}#{item.entityId}]
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-warm-400">{timeAgo(item.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
