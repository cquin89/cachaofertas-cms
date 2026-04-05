import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { MousePointerClick, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { StatsCard } from '@/components/shared/StatsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCLP, formatNumber, formatDateShort } from '@/lib/utils';
import api from '@/lib/axios';
import type { AffiliateReport, AffiliateNetwork } from '@/types/affiliate';
import type { ApiResponse } from '@/types/api';
import type { DateRange } from '@/types/api';

const NETWORK_LABELS: Record<AffiliateNetwork, string> = {
  cj:         'CJ',
  awin:       'Awin',
  impact:     'Impact',
  partnerize: 'Partnerize',
  custom:     'Custom',
};

function defaultRange(): DateRange {
  const to   = new Date();
  const from = new Date(Date.now() - 30 * 86400000);
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

export default function AffiliateReportPage() {
  const [range, setRange] = useState<DateRange>(defaultRange());

  const { data, isLoading } = useQuery({
    queryKey: ['affiliate-report', range],
    queryFn: async () => {
      const params = new URLSearchParams({ from: range.from, to: range.to });
      const res = await api.get<ApiResponse<AffiliateReport>>(`/admin/affiliate/report?${params}`);
      return res.data.data;
    },
    staleTime: 60_000,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reporte de Afiliación"
        description="Clicks, conversiones y revenue de todos los programas."
        actions={
          <DateRangePicker
            value={range}
            onChange={(r) => r && setRange(r)}
          />
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard
          title="Clicks totales"
          value={data?.summary.totalClicks ?? 0}
          icon={MousePointerClick}
          loading={isLoading}
        />
        <StatsCard
          title="Conversiones"
          value={data?.summary.totalConversions ?? 0}
          icon={ShoppingCart}
          loading={isLoading}
        />
        <StatsCard
          title="Tasa de conversión"
          value={data ? `${(data.summary.conversionRate * 100).toFixed(1)}%` : '—'}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatsCard
          title="Revenue total"
          value={data ? formatCLP(data.summary.totalRevenue) : '—'}
          icon={DollarSign}
          loading={isLoading}
        />
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">Clicks y conversiones en el tiempo</h3>
        {isLoading ? (
          <Skeleton className="h-56 w-full" rounded="lg" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.timeSeries ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="conversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDateShort(v)}
                tick={{ fontSize: 11, fill: '#9c8870' }}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9c8870' }} />
              <Tooltip
                contentStyle={{ border: '1px solid #e8ddd2', borderRadius: 8, fontSize: 12 }}
                labelFormatter={(v) => formatDateShort(v as string)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#F97316" fill="url(#clicks)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="conversions" name="Conversiones" stroke="#22c55e" fill="url(#conversions)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table by store */}
      <div className="rounded-lg border border-warm-200 bg-white shadow-sm">
        <div className="border-b border-warm-100 px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-warm-800">Por tienda</h3>
        </div>
        {isLoading ? (
          <div className="divide-y divide-warm-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <Skeleton className="h-8 w-8" rounded="full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !data?.byStore.length ? (
          <p className="px-5 py-8 text-center text-sm text-warm-400">Sin datos para el período seleccionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200 bg-warm-50">
                  {['Tienda', 'Red', 'Clicks', 'Conversiones', 'Conv. %', 'Revenue', 'Comisión media'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-warm-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.byStore.map((row) => (
                  <tr key={row.storeId} className="border-b border-warm-100 hover:bg-warm-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.storeLogoUrl && (
                          <img src={row.storeLogoUrl} alt="" className="h-6 w-6 rounded object-contain" />
                        )}
                        <span className="font-medium text-warm-800">{row.storeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-warm-500">{NETWORK_LABELS[row.network]}</td>
                    <td className="px-4 py-3 text-warm-700">{formatNumber(row.clicks)}</td>
                    <td className="px-4 py-3 text-warm-700">{formatNumber(row.conversions)}</td>
                    <td className="px-4 py-3 text-warm-600">{(row.conversionRate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 font-medium text-success-700">{formatCLP(row.revenue)}</td>
                    <td className="px-4 py-3 text-warm-600">{formatCLP(row.avgCommission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
