import { useQuery } from '@tanstack/react-query';
import { subDays, format } from 'date-fns';
import api from '@/lib/axios';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
  DashboardStats,
  DealAnalyticsStats,
  AuditLogEntry,
} from '@/types/analytics';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useDealAnalytics() {
  const from = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const to   = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['deal-analytics', from, to],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DealAnalyticsStats>>(
        `/admin/analytics/deals?from=${from}&to=${to}`
      );
      return res.data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<AuditLogEntry>>>(
        '/admin/audit-log?limit=8&page=0'
      );
      return res.data.data.data;
    },
    staleTime: 30_000,
    // No reintentar si el endpoint aún no existe
    retry: false,
  });
}
