import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { TempBadge } from '@/components/shared/TempBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatNumber } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

interface TopDeal {
  id: number;
  title: string;
  temperature: number;
  clickCount: number;
}

interface TopDealsTableProps {
  deals: TopDeal[] | undefined;
  loading: boolean;
}

export function TopDealsTable({ deals, loading }: TopDealsTableProps) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white shadow-sm">
      <div className="border-b border-warm-100 px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-warm-800">
          Top deals por temperatura
        </h3>
        <p className="text-xs text-warm-400">Más populares ahora</p>
      </div>

      {loading ? (
        <div className="divide-y divide-warm-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <Skeleton className="h-4 w-4 shrink-0" rounded="full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-14" rounded="full" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : !deals || deals.length === 0 ? (
        <EmptyState
          title="Sin datos"
          description="No hay ofertas activas en este momento."
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-warm-100">
          {deals.slice(0, 5).map((deal, idx) => (
            <div
              key={deal.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-warm-50"
            >
              {/* Ranking */}
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warm-100 text-xs font-bold text-warm-500">
                {idx + 1}
              </span>

              {/* Título */}
              <Link
                to={ROUTES.DEAL_DETAIL(deal.id)}
                className="min-w-0 flex-1 truncate text-sm font-medium text-warm-800 hover:text-primary-600 hover:underline"
              >
                {deal.title}
              </Link>

              {/* Temperatura */}
              <TempBadge temperature={deal.temperature} />

              {/* Clicks */}
              <span className="flex items-center gap-1 text-xs text-warm-400">
                <ExternalLink size={11} />
                {formatNumber(deal.clickCount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-warm-100 px-5 py-3">
        <Link
          to={ROUTES.DEALS}
          className="text-xs font-medium text-primary-500 hover:text-primary-600 hover:underline"
        >
          Ver todas las ofertas →
        </Link>
      </div>
    </div>
  );
}
