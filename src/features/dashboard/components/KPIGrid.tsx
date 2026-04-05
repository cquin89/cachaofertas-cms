import { Tag, Users, MousePointerClick, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { formatCLP } from '@/lib/utils';
import type { DashboardStats } from '@/types/analytics';

interface KPIGridProps {
  stats: DashboardStats | undefined;
  loading: boolean;
}

export function KPIGrid({ stats, loading }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Ofertas Activas"
        value={stats?.activeDeals ?? 0}
        icon={Tag}
        change={stats?.activeDealsChangePercent}
        changeLabel="vs ayer"
        loading={loading}
      />
      <StatsCard
        title="Usuarios Registrados"
        value={stats?.totalUsers ?? 0}
        icon={Users}
        change={undefined}
        changeLabel={stats ? `+${stats.newUsersToday} hoy` : undefined}
        loading={loading}
      />
      <StatsCard
        title="Clicks Afiliados Hoy"
        value={stats?.affiliateClicksToday ?? 0}
        icon={MousePointerClick}
        change={stats?.affiliateClicksVsAvg7d}
        changeLabel="vs promedio 7d"
        loading={loading}
      />
      <StatsCard
        title="Revenue Est. Mes"
        value={stats ? formatCLP(stats.estimatedRevenueMonth) : '—'}
        icon={DollarSign}
        change={stats?.estimatedRevenueChangePercent}
        changeLabel="vs mes anterior"
        loading={loading}
      />
    </div>
  );
}
