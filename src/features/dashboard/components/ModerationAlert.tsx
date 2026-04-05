import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';

interface ModerationAlertProps {
  count: number;
}

export function ModerationAlert({ count }: ModerationAlertProps) {
  if (count === 0) return null;

  return (
    <div className="animate-pulse-orange flex items-center justify-between gap-4 rounded-lg border border-primary-200 bg-primary-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <AlertTriangle size={18} className="text-primary-600" />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-primary-800">
            {count} {count === 1 ? 'item pendiente' : 'items pendientes'} de moderación
          </p>
          <p className="text-xs text-primary-600">
            Hay contenido esperando revisión en la cola de moderación.
          </p>
        </div>
      </div>
      <Button variant="primary" size="sm" asChild>
        <Link to={ROUTES.MODERATION} className="flex items-center gap-1.5">
          Revisar
          <ArrowRight size={14} />
        </Link>
      </Button>
    </div>
  );
}
