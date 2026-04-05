import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { Deal, DealListParams, DealPriceHistory, DealEditHistoryItem } from '@/types/deal';
import type { AuditLogEntry } from '@/types/analytics';

export function useDeals(params: DealListParams) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: async () => {
      const search = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== false) search.set(k, String(v));
      });
      const res = await api.get<ApiResponse<PageResponse<Deal>>>(
        `/admin/deals?${search.toString()}`
      );
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useDeal(id: number) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Deal>>(`/admin/deals/${id}`);
      return res.data.data;
    },
    enabled: id > 0,
  });
}

export function useDealPriceHistory(id: number) {
  return useQuery({
    queryKey: ['deal-price-history', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DealPriceHistory[]>>(
        `/deals/${id}/price-history`
      );
      return res.data.data;
    },
    enabled: id > 0,
  });
}

export function useDealEditHistory(id: number) {
  return useQuery({
    queryKey: ['deal-edit-history', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<AuditLogEntry>>>(
        `/admin/audit-log?entityType=deal&entityId=${id}&limit=20`
      );
      return res.data.data.data;
    },
    enabled: id > 0,
    retry: false,
  });
}

// Alias para compatibilidad con el spec
export type { DealEditHistoryItem };
