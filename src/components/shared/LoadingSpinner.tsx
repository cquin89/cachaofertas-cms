import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = 20, className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} role="status" aria-label={label ?? 'Cargando'}>
      <Loader2 size={size} className="animate-spin text-primary-500" />
      {label && <span className="text-sm text-warm-500">{label}</span>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <LoadingSpinner size={32} />
      <p className="text-sm text-warm-400">Cargando...</p>
    </div>
  );
}
