import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTE_LABELS } from '@/config/routes';

export function Breadcrumbs() {
  const location = useLocation();

  const segments = location.pathname
    .split('/')
    .filter(Boolean);

  // No mostrar breadcrumbs en dashboard (ruta raíz)
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return null;
  }

  const crumbs = segments.map((seg, idx) => {
    const path = '/' + segments.slice(0, idx + 1).join('/');
    // Si el segmento es un ID numérico, mostrarlo como número
    const isId = /^\d+$/.test(seg);
    const label = isId ? `#${seg}` : (ROUTE_LABELS[seg] ?? seg);
    return { path, label, isId };
  });

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center text-warm-400 transition-colors hover:text-warm-200"
          >
            <Home size={14} />
          </Link>
        </li>

        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-warm-600" />
              {isLast ? (
                <span className="font-medium text-warm-200">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className={cn(
                    'text-warm-400 transition-colors hover:text-warm-200',
                    crumb.isId && 'font-mono text-xs'
                  )}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
