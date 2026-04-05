import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface CanProps {
  perform: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza children solo si el usuario tiene el permiso indicado.
 * Para rutas completas usar RequireRole. Este componente controla
 * elementos individuales dentro de una página.
 */
export function Can({ perform, children, fallback = null }: CanProps) {
  const { can } = usePermission();
  return can(perform) ? <>{children}</> : <>{fallback}</>;
}
