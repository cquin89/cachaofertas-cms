import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatNumber, formatPercent } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: number;
  changeLabel?: string;
  loading?: boolean;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function StatsCard({
  title, value, icon: Icon, change, changeLabel,
  loading, className, valuePrefix, valueSuffix,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-lg border border-warm-200 bg-white p-5 shadow-sm', className)}>
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8" rounded="lg" />
        </div>
        <Skeleton className="mt-4 h-8 w-24" />
        <Skeleton className="mt-2 h-3 w-32" />
      </div>
    );
  }

  const formatted = typeof value === 'number' ? formatNumber(value) : value;
  const isPositive = (change ?? 0) > 0;
  const isNegative = (change ?? 0) < 0;

  return (
    <div
      className={cn(
        'rounded-lg border border-warm-200 bg-white p-5 shadow-sm',
        'hover:shadow-md transition-shadow duration-250',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-warm-500">{title}</p>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
            <Icon size={18} className="text-primary-500" />
          </span>
        )}
      </div>

      <p className="mt-3 font-display text-3xl font-bold text-warm-900">
        {valuePrefix && <span className="text-xl text-warm-500">{valuePrefix}</span>}
        {formatted}
        {valueSuffix && <span className="ml-1 text-base font-medium text-warm-400">{valueSuffix}</span>}
      </p>

      {change !== undefined && (
        <div className={cn(
          'mt-2 flex items-center gap-1 text-xs font-medium',
          isPositive ? 'text-success-700' : isNegative ? 'text-danger-700' : 'text-warm-500'
        )}>
          {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{formatPercent(change)}</span>
          {changeLabel && <span className="font-normal text-warm-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
