import { useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { resolvePermissions } from '@/config/permissions';

export function usePermission() {
  const role = useAuthStore((s) => s.user?.role ?? '');

  const permissions = useMemo(() => resolvePermissions(role), [role]);

  const can = useCallback(
    (action: string) => permissions.has('*') || permissions.has(action),
    [permissions]
  );

  return { can };
}
