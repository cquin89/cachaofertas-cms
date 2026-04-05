import type { UserRole } from '@/stores/authStore';

export type { UserRole };

export type UserStatus = 'active' | 'banned' | 'unverified' | 'deleted';

export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  reputation: number;
  isEmailVerified: boolean;
  isBanned: boolean;
  banReason: string | null;
  banExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastSeenAt: string | null;
}

export interface UserProfile extends User {
  bio: string | null;
  location: string | null;
  website: string | null;
  dealsCount: number;
  commentsCount: number;
  savedDealsCount: number;
  badges: UserBadge[];
  stats: UserStats;
}

export interface UserBadge {
  id: number;
  code: string;
  name: string;
  description: string;
  iconUrl: string | null;
  awardedAt: string;
}

export interface UserStats {
  totalDeals: number;
  totalComments: number;
  totalVotes: number;
  hotDeals: number;
  avgTemperature: number;
}

export interface UserActivityItem {
  id: number;
  type: 'deal_posted' | 'comment_posted' | 'deal_voted' | 'badge_earned' | 'account_banned' | 'role_changed';
  description: string;
  entityId: number | null;
  entityType: string | null;
  createdAt: string;
  performedBy: string | null;
}

/** Parámetros de filtrado para la lista de usuarios */
export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  sortBy?: 'createdAt' | 'reputation' | 'lastSeenAt' | 'dealsCount';
  sortDir?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface BanUserRequest {
  reason: string;
  expiresAt?: string;
}

export interface ChangeRoleRequest {
  role: UserRole;
}
