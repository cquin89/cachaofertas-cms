import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { KPIGrid } from './components/KPIGrid';
import { DealsChart } from './components/DealsChart';
import { TopDealsTable } from './components/TopDealsTable';
import { RecentActivity } from './components/RecentActivity';
import { ModerationAlert } from './components/ModerationAlert';
import {
  useDashboardStats,
  useDealAnalytics,
  useRecentActivity,
} from './hooks/useDashboardStats';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: stats,    isLoading: statsLoading }    = useDashboardStats();
  const { data: analytics, isLoading: analyticsLoading } = useDealAnalytics();
  const { data: activity,  isLoading: activityLoading, isError: activityError } = useRecentActivity();

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['deal-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    toast.success('Dashboard actualizado');
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Resumen general de la plataforma"
        actions={
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw size={14} />
            Actualizar
          </Button>
        }
      />

      {/* Alerta de moderación pendiente */}
      {!statsLoading && (stats?.pendingModerationCount ?? 0) > 0 && (
        <ModerationAlert count={stats!.pendingModerationCount} />
      )}

      {/* KPIs */}
      <KPIGrid stats={stats} loading={statsLoading} />

      {/* Gráficos — 2 columnas en desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Area chart — ocupa 2/3 */}
        <div className="lg:col-span-2">
          <DealsChart
            data={analytics?.timeSeries}
            loading={analyticsLoading}
          />
        </div>

        {/* Top deals — ocupa 1/3 */}
        <TopDealsTable
          deals={analytics?.topByTemperature}
          loading={analyticsLoading}
        />
      </div>

      {/* Actividad reciente — full width */}
      <RecentActivity
        items={activity}
        loading={activityLoading}
        error={activityError}
      />
    </div>
  );
}
