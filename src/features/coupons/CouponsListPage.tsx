import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RowSelectionState } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CouponStatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Can } from '@/components/shared/Can';
import { formatDate, formatCLP, timeAgo } from '@/lib/utils';
import api from '@/lib/axios';
import type { Coupon, CouponStatus, CouponListParams } from '@/types/coupon';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';
import { PAGINATION_DEFAULTS } from '@/config/constants';

const COUPON_TYPE_LABELS: Record<string, string> = {
  percentage:   '% Descuento',
  fixed:        '$ Fijo',
  free_shipping: 'Envío gratis',
  buy_x_get_y:  'X+Y',
  other:        'Otro',
};

export default function CouponsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const qc = useQueryClient();

  const filters: CouponListParams = {
    search:         searchParams.get('search')   ?? undefined,
    status:         (searchParams.get('status')  ?? '') as CouponStatus | '',
    includeDeleted: searchParams.get('includeDeleted') === 'true',
    page:           Number(searchParams.get('page') ?? '0'),
    limit:          Number(searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.PAGE_SIZE)),
  };

  const setFilter = useCallback(
    (updates: Partial<CouponListParams>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === undefined || v === '' || v === false) next.delete(k);
          else next.set(k, String(v));
        });
        if (!('page' in updates)) next.delete('page');
        return next;
      });
      setSelectedRows({});
    },
    [setSearchParams]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== false) params.set(k, String(v));
      });
      const res = await api.get<ApiResponse<PageResponse<Coupon>>>(`/admin/coupons?${params}`);
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: CouponStatus }) =>
      api.patch(`/admin/coupons/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al cambiar estado'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      toast.success('Cupón eliminado');
      qc.invalidateQueries({ queryKey: ['coupons'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/coupons/${id}/restore`),
    onSuccess: () => {
      toast.success('Cupón restaurado');
      qc.invalidateQueries({ queryKey: ['coupons'] });
    },
  });

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
      cell: ({ row }) => (
        <div>
          <span className="font-mono text-sm font-semibold text-warm-800">{row.original.code}</span>
          <p className="text-xs text-warm-500 line-clamp-1">{row.original.title}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      size: 110,
      cell: ({ getValue }) => (
        <Badge variant="info">{COUPON_TYPE_LABELS[getValue() as string] ?? getValue() as string}</Badge>
      ),
    },
    {
      accessorKey: 'value',
      header: 'Valor',
      size: 90,
      cell: ({ row }) => {
        const { type, value } = row.original;
        if (!value) return <span className="text-warm-400">—</span>;
        return (
          <span className="text-sm text-warm-700">
            {type === 'percentage' ? `${value}%` : formatCLP(value)}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 110,
      cell: ({ getValue }) => <CouponStatusBadge status={getValue() as CouponStatus} />,
    },
    {
      accessorKey: 'storeName',
      header: 'Tienda',
      size: 120,
      cell: ({ getValue }) => <span className="text-sm text-warm-600">{getValue() as string}</span>,
    },
    {
      accessorKey: 'usageCount',
      header: 'Usos',
      size: 80,
      cell: ({ row }) => (
        <span className="text-xs text-warm-500">
          {row.original.usageCount}{row.original.maxUsage ? `/${row.original.maxUsage}` : ''}
        </span>
      ),
    },
    {
      accessorKey: 'expiresAt',
      header: 'Vence',
      size: 110,
      cell: ({ getValue }) => (
        <span className="text-xs text-warm-400">
          {getValue() ? timeAgo(getValue() as string) : 'Sin vencimiento'}
        </span>
      ),
    },
    {
      id: 'actions',
      size: 110,
      cell: ({ row }) => {
        if (row.original.deletedAt) {
          return (
            <Can perform="coupons:update">
              <button
                type="button"
                onClick={() => restoreMutation.mutate(row.original.id)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-success-600 hover:bg-success-50"
              >
                <RotateCcw size={12} />
                Restaurar
              </button>
            </Can>
          );
        }
        return (
          <div className="flex items-center gap-1">
            <Can perform="coupons:update">
              {row.original.status !== 'active' && (
                <button
                  type="button"
                  onClick={() => changeStatus.mutate({ id: row.original.id, status: 'active' })}
                  className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-success-50 hover:text-success-600"
                  title="Aprobar"
                >
                  <CheckCircle size={14} />
                </button>
              )}
              {row.original.status !== 'rejected' && (
                <button
                  type="button"
                  onClick={() => changeStatus.mutate({ id: row.original.id, status: 'rejected' })}
                  className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-danger-50 hover:text-danger-600"
                  title="Rechazar"
                >
                  <XCircle size={14} />
                </button>
              )}
            </Can>
            <Can perform="coupons:delete">
              <button
                type="button"
                onClick={() => setDeletingId(row.original.id)}
                className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-danger-50 hover:text-danger-600"
              >
                <Trash2 size={14} />
              </button>
            </Can>
          </div>
        );
      },
    },
  ];

  const deletingCoupon = data?.data.find((c) => c.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cupones" description="Gestiona y verifica los cupones de descuento." />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search ?? ''}
          onChange={(v) => setFilter({ search: v })}
          placeholder="Buscar cupones…"
          className="max-w-xs"
        />
        <Select
          value={filters.status ?? ''}
          onValueChange={(v) => setFilter({ status: v as CouponStatus | '' })}
          className="w-36"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="expired">Expirado</option>
          <option value="unverified">Sin verificar</option>
          <option value="rejected">Rechazado</option>
        </Select>
        <label className="flex items-center gap-2 text-sm text-warm-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.includeDeleted ?? false}
            onChange={(e) => setFilter({ includeDeleted: e.target.checked })}
            className="h-4 w-4 accent-primary-500"
          />
          Incluir eliminados
        </label>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        deletedRowKey="deletedAt"
        selectable
        selectedRows={selectedRows}
        onRowSelectionChange={setSelectedRows}
        serverPagination={data ? {
          total: data.total,
          pageIndex: filters.page ?? 0,
          pageSize: filters.limit ?? PAGINATION_DEFAULTS.PAGE_SIZE,
          onPageChange: (page) => setFilter({ page }),
          onPageSizeChange: (limit) => setFilter({ limit }),
        } : undefined}
        emptyTitle="Sin cupones"
        emptyDescription="No se encontraron cupones con los filtros actuales."
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar cupón"
        description={`¿Eliminar el cupón "${deletingCoupon?.code}"?`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
