import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  content_editor:    1,
  affiliate_manager: 2,
  moderator:         3,
  admin:             4,
  super_admin:       5,
};

export function useAuth() {
  const { user, accessToken, isAuthenticated, logout } = useAuthStore();

  function hasRole(role: UserRole): boolean {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
  }

  function isExactRole(role: UserRole): boolean {
    return user?.role === role;
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    logout,
    hasRole,
    isExactRole,
    isModerator:  hasRole('moderator'),
    isAdmin:      hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),
  };
}
