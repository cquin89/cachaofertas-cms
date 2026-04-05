import { Flame, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TempBadgeProps {
  temperature: number;
  className?: string;
}

export function TempBadge({ temperature, className }: TempBadgeProps) {
  const config =
    temperature >= 300
      ? { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    Icon: Flame,       animate: 'animate-pulse-hot' }
      : temperature >= 100
      ? { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', Icon: TrendingUp,  animate: '' }
      : temperature >= 0
      ? { bg: 'bg-warm-100',  text: 'text-warm-600',   border: 'border-warm-200',   Icon: Minus,       animate: '' }
      : { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   Icon: TrendingDown, animate: '' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        config.bg,
        config.text,
        config.border,
        config.animate,
        className
      )}
    >
      <config.Icon size={11} />
      {temperature}°
    </span>
  );
}
