import type { UserRole } from '@/stores/authStore';

/**
 * Mapa estático rol → permisos granulares.
 * Formato: "acción:entidad"
 * Mantener alineado con los guards del backend.
 */
const CONTENT_EDITOR_PERMISSIONS = [
  'create:page', 'edit:page',
  'create:faq', 'edit:faq',
  'create:banner', 'edit:banner',
  'create:announcement', 'edit:announcement',
  'create:event', 'edit:event',
];

const AFFILIATE_MANAGER_PERMISSIONS = [
  ...CONTENT_EDITOR_PERMISSIONS,
  'create:store', 'edit:store',
  'edit:affiliate_config',
  'view:affiliate_report',
];

const MODERATOR_PERMISSIONS = [
  ...AFFILIATE_MANAGER_PERMISSIONS,
  'view:moderation_queue', 'resolve:moderation',
  'edit:deal_status', 'feature:deal',
  'warn:user', 'ban:user', 'unban:user',
  'edit:coupon_status',
  'manage:banned_words', 'manage:ip_bans',
  'view:users', 'view:deals', 'view:coupons',
];

const ADMIN_PERMISSIONS = [
  ...MODERATOR_PERMISSIONS,
  'delete:deal', 'delete:page', 'delete:banner', 'delete:faq',
  'delete:announcement', 'delete:event', 'delete:store', 'delete:category',
  'delete:coupon', 'delete:comment',
  'edit:user_role',
  'edit:feature_flag', 'edit:system_config',
  'view:analytics', 'view:audit_log',
  'restore:deal', 'restore:user', 'restore:comment',
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  content_editor:    CONTENT_EDITOR_PERMISSIONS,
  affiliate_manager: AFFILIATE_MANAGER_PERMISSIONS,
  moderator:         MODERATOR_PERMISSIONS,
  admin:             ADMIN_PERMISSIONS,
  super_admin:       ['*'],
};

/** Resuelve el Set de permisos efectivo para un rol */
export function resolvePermissions(role: UserRole | string): Set<string> {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return new Set();
  return new Set(perms);
}
