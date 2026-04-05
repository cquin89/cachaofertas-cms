import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  content_editor:    1,
  affiliate_manager: 2,
  moderator:         3,
  admin:             4,
  super_admin:       5,
};

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
}

/**
 * Protege rutas completas por rol mínimo requerido.
 * Para elementos dentro de una página usar <Can perform="...">.
 */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const userRole = useAuthStore((s) => s.user?.role);

  if (!userRole) return <Navigate to="/login" replace />;

  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const hasAccess = roles.some((r) => userLevel >= ROLE_HIERARCHY[r]);

  if (!hasAccess) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
