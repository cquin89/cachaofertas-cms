import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Globe } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/shared/SearchInput';
import { Can } from '@/components/shared/Can';
import { formatNumber } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import type { Store } from '@/types/affiliate';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';

export default function StoresListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['stores', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50', page: '0' });
      if (search) params.set('search', search);
      const res = await api.get<ApiResponse<PageResponse<Store>>>(`/admin/stores?${params}`);
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/stores/${id}`),
    onSuccess: () => {
      toast.success('Tienda eliminada');
      qc.invalidateQueries({ queryKey: ['stores'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const columns: ColumnDef<Store>[] = [
    {
      accessorKey: 'name',
      header: 'Tienda',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.logoUrl ? (
            <img src={row.original.logoUrl} alt={row.original.name} className="h-8 w-8 rounded object-contain border border-warm-100 bg-warm-50" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded border border-warm-200 bg-warm-100">
              <Globe size={14} className="text-warm-400" />
            </div>
          )}
          <div>
            <Link
              to={ROUTES.STORE_EDIT(row.original.id)}
              className="font-medium text-sm text-warm-800 hover:text-primary-600 hover:underline"
            >
              {row.original.name}
            </Link>
            <p className="text-xs text-warm-400">{row.original.domain}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      size: 100,
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? 'success' : 'default'}>{getValue() ? 'Activa' : 'Inactiva'}</Badge>
      ),
    },
    {
      accessorKey: 'dealCount',
      header: 'Ofertas',
      size: 90,
      cell: ({ getValue }) => <span className="text-sm text-warm-600">{formatNumber(getValue() as number)}</span>,
    },
    {
      accessorKey: 'clickCount',
      header: 'Clicks',
      size: 90,
      cell: ({ getValue }) => <span className="text-sm text-warm-600">{formatNumber(getValue() as number)}</span>,
    },
    {
      id: 'affiliate',
      header: 'Programas afiliación',
      size: 140,
      cell: ({ row }) => (
        <span className="text-sm text-warm-500">
          {row.original.affiliatePrograms.length > 0
            ? row.original.affiliatePrograms.map((p) => p.network.toUpperCase()).join(', ')
            : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      size: 80,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Can perform="stores:update">
            <Link
              to={ROUTES.STORE_EDIT(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100"
            >
              <Pencil size={14} />
            </Link>
          </Can>
          <Can perform="stores:delete">
            <button
              type="button"
              onClick={() => setDeletingId(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-danger-50 hover:text-danger-600"
            >
              <Trash2 size={14} />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  const deletingStore = data?.data.find((s) => s.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tiendas"
        description="Gestiona las tiendas y sus programas de afiliación."
        actions={
          <Can perform="stores:create">
            <Button onClick={() => navigate(ROUTES.STORE_NEW)}>
              <Plus size={16} />
              Nueva tienda
            </Button>
          </Can>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar tiendas…" className="max-w-xs" />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyTitle="Sin tiendas"
        emptyDescription="Crea tu primera tienda."
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar tienda"
        description={`¿Eliminar "${deletingStore?.name}"? Se eliminarán también sus programas de afiliación.`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
