import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, type TooltipProps,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { BarChart2 } from 'lucide-react';
import type { DealAnalyticsDataPoint } from '@/types/analytics';

interface DealsChartProps {
  data: DealAnalyticsDataPoint[] | undefined;
  loading: boolean;
}

export function DealsChart({ data, loading }: DealsChartProps) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-warm-800">
            Ofertas publicadas
          </h3>
          <p className="text-xs text-warm-400">Últimos 30 días</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-warm-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-500" />
            Publicadas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-warm-300" />
            Expiradas
          </span>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="Sin datos"
          description="No hay información de deals para este período."
          icon={BarChart2}
          className="py-8"
        />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="publishedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expiredGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#A8A29E" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#A8A29E" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#A8A29E' }}
              tickFormatter={(v: string) => {
                try { return format(parseISO(v), 'd MMM', { locale: es }); }
                catch { return v; }
              }}
              interval="preserveStartEnd"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#A8A29E' }}
              allowDecimals={false}
            />

            <Tooltip content={<ChartTooltip />} />

            <Area
              type="monotone"
              dataKey="expired"
              stroke="#A8A29E"
              strokeWidth={1.5}
              fill="url(#expiredGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#A8A29E' }}
            />
            <Area
              type="monotone"
              dataKey="published"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#publishedGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  let formattedLabel = label as string;
  try { formattedLabel = format(parseISO(label as string), "d 'de' MMMM", { locale: es }); }
  catch { /* keep raw */ }

  return (
    <div className="rounded-lg border border-warm-200 bg-white px-3 py-2.5 shadow-lg text-xs">
      <p className="mb-2 font-semibold text-warm-700">{formattedLabel}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-warm-500">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.dataKey === 'published' ? 'Publicadas' : 'Expiradas'}
          </span>
          <span className="font-semibold text-warm-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
