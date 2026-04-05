import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
  ModerationItem,
  ModerationItemType,
  ModerationAction,
  ModerationStats,
} from '@/types/moderation';

export function useModerationQueue(type: ModerationItemType | '', page = 0, limit = 20) {
  return useQuery({
    queryKey: ['moderation-queue', type, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ status: 'pending', limit: String(limit), page: String(page) });
      if (type) params.set('type', type);
      const res = await api.get<ApiResponse<PageResponse<ModerationItem>>>(
        `/admin/moderation/queue?${params.toString()}`
      );
      return res.data.data;
    },
    staleTime: 15_000,
    refetchInterval: 30_000, // Auto-refresh cada 30s
  });
}

export function useModerationStats() {
  return useQuery({
    queryKey: ['moderation-stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ModerationStats>>(
        '/admin/moderation/queue?status=pending&limit=1'
      );
      // El total de cada tipo viene de queries separadas
      return res.data.data;
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function usePendingCounts() {
  const dealQ    = useQuery({ queryKey: ['mod-count-deal'],    queryFn: () => fetchCount('deal'),    staleTime: 30_000 });
  const commentQ = useQuery({ queryKey: ['mod-count-comment'], queryFn: () => fetchCount('comment'), staleTime: 30_000 });
  const userQ    = useQuery({ queryKey: ['mod-count-user'],    queryFn: () => fetchCount('user'),    staleTime: 30_000 });

  return {
    deal:    dealQ.data ?? 0,
    comment: commentQ.data ?? 0,
    user:    userQ.data ?? 0,
    total:   (dealQ.data ?? 0) + (commentQ.data ?? 0) + (userQ.data ?? 0),
  };
}

async function fetchCount(type: ModerationItemType): Promise<number> {
  const res = await api.get<ApiResponse<PageResponse<ModerationItem>>>(
    `/admin/moderation/queue?type=${type}&status=pending&limit=1&page=0`
  );
  return res.data.data.total;
}

export function useResolveModeration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: ModerationAction; reason?: string }) =>
      api.put<ApiResponse<ModerationItem>>(`/admin/moderation/${id}`, { action, reason }),
    onSuccess: (_, { action }) => {
      const labels: Partial<Record<ModerationAction, string>> = {
        approve: 'Aprobado',
        reject:  'Rechazado',
        delete:  'Eliminado',
        warn:    'Advertencia enviada',
        ban:     'Usuario baneado',
        ignore:  'Ignorado',
      };
      toast.success(labels[action] ?? 'Acción completada');
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['mod-count-deal'] });
      queryClient.invalidateQueries({ queryKey: ['mod-count-comment'] });
      queryClient.invalidateQueries({ queryKey: ['mod-count-user'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats-nav'] });
    },
    onError: (error) => handleMutationError(error),
  });
}
