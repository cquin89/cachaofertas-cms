import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Users, Eye, Tag, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { StatsCard } from '@/components/shared/StatsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatNumber, formatDateShort } from '@/lib/utils';
import api from '@/lib/axios';
import type { TrafficStats, DealAnalyticsStats, UserAnalyticsStats, SearchAnalyticsStats } from '@/types/analytics';
import type { ApiResponse } from '@/types/api';
import type { DateRange } from '@/types/api';

function defaultRange(): DateRange {
  const to   = new Date();
  const from = new Date(Date.now() - 30 * 86400000);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

const CHART_COLORS = ['#F97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>(defaultRange());
  const [activeTab, setActiveTab] = useState<'traffic' | 'deals' | 'users' | 'search'>('traffic');

  const queryParams = new URLSearchParams({ from: range.from, to: range.to }).toString();

  const trafficQ = useQuery({
    queryKey: ['analytics-traffic', range],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TrafficStats>>(`/admin/analytics/traffic?${queryParams}`);
      return res.data.data;
    },
    enabled: activeTab === 'traffic',
    staleTime: 60_000,
  });

  const dealsQ = useQuery({
    queryKey: ['analytics-deals', range],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DealAnalyticsStats>>(`/admin/analytics/deals?${queryParams}`);
      return res.data.data;
    },
    enabled: activeTab === 'deals',
    staleTime: 60_000,
  });

  const usersQ = useQuery({
    queryKey: ['analytics-users', range],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UserAnalyticsStats>>(`/admin/analytics/users?${queryParams}`);
      return res.data.data;
    },
    enabled: activeTab === 'users',
    staleTime: 60_000,
  });

  const searchQ = useQuery({
    queryKey: ['analytics-search', range],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SearchAnalyticsStats>>(`/admin/analytics/search?${queryParams}`);
      return res.data.data;
    },
    enabled: activeTab === 'search',
    staleTime: 60_000,
  });

  const tabs = [
    { id: 'traffic' as const, label: 'Tráfico', icon: Eye },
    { id: 'deals'   as const, label: 'Ofertas', icon: Tag },
    { id: 'users'   as const, label: 'Usuarios', icon: Users },
    { id: 'search'  as const, label: 'Búsquedas', icon: Search },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Métricas de tráfico, ofertas, usuarios y búsquedas."
        actions={
          <DateRangePicker
            value={range}
            onChange={(r) => r && setRange(r)}
          />
        }
      />

      {/* Tabs */}
      <div className="border-b border-warm-200">
        <nav className="-mb-px flex gap-0.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-warm-500 hover:border-warm-300 hover:text-warm-700'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Traffic */}
      {activeTab === 'traffic' && (
        <TrafficPanel data={trafficQ.data} loading={trafficQ.isLoading} />
      )}

      {/* Deals */}
      {activeTab === 'deals' && (
        <DealsPanel data={dealsQ.data} loading={dealsQ.isLoading} />
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <UsersPanel data={usersQ.data} loading={usersQ.isLoading} />
      )}

      {/* Search */}
      {activeTab === 'search' && (
        <SearchPanel data={searchQ.data} loading={searchQ.isLoading} />
      )}
    </div>
  );
}

/* ── Sub-panels ── */

function ChartSkeleton() {
  return <Skeleton className="h-56 w-full" rounded="lg" />;
}

function TrafficPanel({ data, loading }: { data?: TrafficStats; loading: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard title="Páginas vistas" value={data?.summary.totalPageViews ?? 0} icon={Eye} loading={loading} />
        <StatsCard title="Visitantes únicos" value={data?.summary.totalUniqueVisitors ?? 0} icon={Users} loading={loading} />
        <StatsCard title="Duración media (s)" value={data?.summary.avgSessionDuration ?? 0} loading={loading} />
        <StatsCard title="Tasa rebote" value={data ? `${(data.summary.bounceRate * 100).toFixed(1)}%` : '—'} loading={loading} />
      </div>

      <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">Tráfico en el tiempo</h3>
        {loading ? <ChartSkeleton /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.timeSeries ?? []}>
              <defs>
                <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
              <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} tick={{ fontSize: 11, fill: '#9c8870' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9c8870' }} />
              <Tooltip contentStyle={{ border: '1px solid #e8ddd2', borderRadius: 8, fontSize: 12 }} labelFormatter={(v) => formatDateShort(v as string)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="pageViews" name="Vistas" stroke="#F97316" fill="url(#pv)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="uniqueVisitors" name="Únicos" stroke="#3b82f6" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopListCard title="Páginas más visitadas" loading={loading}
          items={data?.topPages.map((p) => ({ label: p.path, value: formatNumber(p.views) })) ?? []} />
        <TopListCard title="Fuentes de tráfico" loading={loading}
          items={data?.topReferrers.map((r) => ({ label: r.source, value: formatNumber(r.visits) })) ?? []} />
      </div>
    </div>
  );
}

function DealsPanel({ data, loading }: { data?: DealAnalyticsStats; loading: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">Ofertas publicadas vs. expiradas</h3>
        {loading ? <ChartSkeleton /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.timeSeries ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
              <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} tick={{ fontSize: 11, fill: '#9c8870' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9c8870' }} />
              <Tooltip contentStyle={{ border: '1px solid #e8ddd2', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="published" name="Publicadas" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expired" name="Expiradas" fill="#e8ddd2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopListCard title="Top por temperatura" loading={loading}
          items={data?.topByTemperature.map((d) => ({ label: d.title, value: `${d.temperature}°` })) ?? []} />
        <PiePanel title="Por categoría" loading={loading}
          data={data?.byCategory.map((c, i) => ({ name: c.categoryName, value: c.count, color: CHART_COLORS[i % CHART_COLORS.length] })) ?? []} />
      </div>
    </div>
  );
}

function UsersPanel({ data, loading }: { data?: UserAnalyticsStats; loading: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <StatsCard title="Retención" value={data ? `${(data.retentionRate * 100).toFixed(1)}%` : '—'} loading={loading} />
        <StatsCard title="Ofertas por usuario" value={data?.avgDealsPerUser ?? 0} loading={loading} />
      </div>
      <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">Crecimiento de usuarios</h3>
        {loading ? <ChartSkeleton /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.timeSeries ?? []}>
              <defs>
                <linearGradient id="nu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
              <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} tick={{ fontSize: 11, fill: '#9c8870' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9c8870' }} />
              <Tooltip contentStyle={{ border: '1px solid #e8ddd2', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="newUsers" name="Nuevos" stroke="#F97316" fill="url(#nu)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="activeUsers" name="Activos" stroke="#22c55e" fill="none" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <PiePanel title="Por rol" loading={loading}
        data={data?.byRole.map((r, i) => ({ name: r.role, value: r.count, color: CHART_COLORS[i % CHART_COLORS.length] })) ?? []} />
    </div>
  );
}

function SearchPanel({ data, loading }: { data?: SearchAnalyticsStats; loading: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Búsquedas totales" value={data?.totalSearches ?? 0} loading={loading} />
        <StatsCard title="CTR búsquedas" value={data ? `${(data.clickThroughRate * 100).toFixed(1)}%` : '—'} loading={loading} />
        <StatsCard title="Resultados medios" value={data?.avgResultsPerQuery ?? 0} loading={loading} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopListCard title="Búsquedas más frecuentes" loading={loading}
          items={data?.topQueries.map((q) => ({ label: q.query, value: `${formatNumber(q.count)} (CTR ${(q.clickRate * 100).toFixed(0)}%)` })) ?? []} />
        <TopListCard title="Búsquedas sin resultados" loading={loading}
          items={data?.zeroResultQueries.map((q) => ({ label: q.query, value: formatNumber(q.count) })) ?? []} />
      </div>
    </div>
  );
}

function TopListCard({ title, items, loading }: { title: string; items: { label: string; value: string }[]; loading: boolean }) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white shadow-sm">
      <div className="border-b border-warm-100 px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-warm-800">{title}</h3>
      </div>
      <div className="divide-y divide-warm-100">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))
          : items.slice(0, 10).map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm text-warm-700 truncate max-w-[200px]">{item.label}</span>
                <span className="text-xs font-medium text-warm-500">{item.value}</span>
              </div>
            ))}
      </div>
    </div>
  );
}

function PiePanel({ title, data, loading }: { title: string; data: { name: string; value: number; color: string }[]; loading: boolean }) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">{title}</h3>
      {loading ? <ChartSkeleton /> : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={160}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-warm-600">{d.name}</span>
                <span className="text-xs font-medium text-warm-800">{formatNumber(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
