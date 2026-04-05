import type { DateRange } from './api';

export interface AnalyticsParams extends DateRange {
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

/** ══ DASHBOARD KPIs ══ */

export interface DashboardStats {
  activeDeals: number;
  activeDealsChangePercent: number;
  totalUsers: number;
  newUsersToday: number;
  affiliateClicksToday: number;
  affiliateClicksVsAvg7d: number;
  estimatedRevenueMonth: number;
  estimatedRevenueChangePercent: number;
  pendingModerationCount: number;
}

/** ══ TRÁFICO ══ */

export interface TrafficDataPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
}

export interface TrafficStats {
  summary: {
    totalPageViews: number;
    totalUniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  timeSeries: TrafficDataPoint[];
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ source: string; visits: number }>;
}

/** ══ DEALS ══ */

export interface DealAnalyticsDataPoint {
  date: string;
  published: number;
  expired: number;
  hotDeals: number;
  avgTemperature: number;
}

export interface DealAnalyticsStats {
  timeSeries: DealAnalyticsDataPoint[];
  topByTemperature: Array<{
    id: number;
    title: string;
    temperature: number;
    clickCount: number;
  }>;
  byCategory: Array<{ categoryName: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
}

/** ══ USUARIOS ══ */

export interface UserGrowthDataPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
  activeUsers: number;
}

export interface UserAnalyticsStats {
  timeSeries: UserGrowthDataPoint[];
  byRole: Array<{ role: string; count: number }>;
  retentionRate: number;
  avgDealsPerUser: number;
}

/** ══ BÚSQUEDAS ══ */

export interface SearchAnalyticsStats {
  topQueries: Array<{ query: string; count: number; clickRate: number }>;
  zeroResultQueries: Array<{ query: string; count: number }>;
  totalSearches: number;
  avgResultsPerQuery: number;
  clickThroughRate: number;
}

/** ══ SETTINGS ══ */

export interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  updatedAt: string;
  updatedByUsername: string | null;
}

export interface SystemConfigEntry {
  key: string;
  value: string;
  description: string | null;
  type: 'string' | 'number' | 'boolean' | 'json';
  updatedAt: string;
  updatedByUsername: string | null;
}

export interface BannedWord {
  id: number;
  word: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  createdByUsername: string;
}

export interface IpBan {
  id: number;
  ipAddress: string;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
  createdByUsername: string;
}

export interface AuditLogEntry {
  id: number;
  userId: number;
  userUsername: string;
  action: string;
  entityType: string;
  entityId: number | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

/** ══ CATEGORÍAS ══ */

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  parentId: number | null;
  parentName: string | null;
  displayOrder: number;
  dealCount: number;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  icon?: string;
  parentId?: number | null;
  displayOrder?: number;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface ReorderCategoriesRequest {
  items: Array<{ id: number; displayOrder: number }>;
}
