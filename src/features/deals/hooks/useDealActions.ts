import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { DealListParams, DealStatus, Deal } from '@/types/deal';
import type { ApiResponse, PageResponse } from '@/types/api';

export function useDealActions(listParams?: DealListParams) {
  const queryClient = useQueryClient();

  const invalidateDeals = () =>
    queryClient.invalidateQueries({ queryKey: ['deals'] });

  /* ── Cambiar status ── */
  const changeStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: DealStatus; reason?: string }) =>
      api.put<ApiResponse<Deal>>(`/admin/deals/${id}/status`, { status, reason }),
    onSuccess: (_, { status }) => {
      toast.success(`Oferta marcada como ${STATUS_LABELS[status] ?? status}`);
      invalidateDeals();
    },
    onError: (error) => handleMutationError(error),
  });

  /* ── Feature / Unfeature — optimistic ── */
  const featureDeal = useMutation({
    mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) =>
      api.put<ApiResponse<Deal>>(`/admin/deals/${id}/feature`, { isFeatured }),
    onMutate: async ({ id, isFeatured }) => {
      const key = ['deals', listParams];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PageResponse<Deal>>(key);
      queryClient.setQueryData<PageResponse<Deal>>(key, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((d) => d.id === id ? { ...d, isFeatured } : d) };
      });
      return { previous, key };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(ctx.key, ctx.previous);
      handleMutationError(error);
    },
    onSuccess: (_, { isFeatured }) => {
      toast.success(isFeatured ? 'Oferta destacada' : 'Oferta quitada de destacados');
    },
    onSettled: () => invalidateDeals(),
  });

  /* ── Eliminar ── */
  const deleteDeal = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/deals/${id}`),
    onSuccess: () => {
      toast.success('Oferta eliminada');
      invalidateDeals();
    },
    onError: (error) => handleMutationError(error),
  });

  /* ── Restaurar (soft-delete) ── */
  const restoreDeal = useMutation({
    mutationFn: (id: number) => api.post<ApiResponse<Deal>>(`/admin/deals/${id}/restore`),
    onSuccess: () => {
      toast.success('Oferta restaurada exitosamente');
      invalidateDeals();
    },
    onError: (error) => handleMutationError(error),
  });

  /* ── Acciones masivas ── */
  const bulkChangeStatus = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: DealStatus }) =>
      Promise.all(ids.map((id) => api.put(`/admin/deals/${id}/status`, { status }))),
    onSuccess: (_, { ids, status }) => {
      toast.success(`${ids.length} ofertas actualizadas a ${STATUS_LABELS[status] ?? status}`);
      invalidateDeals();
    },
    onError: (error) => handleMutationError(error),
  });

  const bulkDelete = useMutation({
    mutationFn: (ids: number[]) =>
      Promise.all(ids.map((id) => api.delete(`/admin/deals/${id}`))),
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} ofertas eliminadas`);
      invalidateDeals();
    },
    onError: (error) => handleMutationError(error),
  });

  return { changeStatus, featureDeal, deleteDeal, restoreDeal, bulkChangeStatus, bulkDelete };
}

const STATUS_LABELS: Partial<Record<DealStatus, string>> = {
  active:   'Activa',
  rejected: 'Rechazada',
  expired:  'Expirada',
  sold_out: 'Agotada',
  pending:  'Pendiente',
};
