import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/shared/Can';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import type { Banner, BannerPosition } from '@/types/cms';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';

const POSITION_LABELS: Record<BannerPosition, string> = {
  homepage_top:       'Inicio — Top',
  category_sidebar:   'Categoría — Sidebar',
  deal_detail_bottom: 'Oferta — Bottom',
};

export default function BannersListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<Banner>>>('/admin/banners?limit=100&page=0');
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      toast.success('Banner eliminado');
      qc.invalidateQueries({ queryKey: ['banners'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar el banner'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.patch(`/admin/banners/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
    onError: () => toast.error('Error al cambiar el estado'),
  });

  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: 'imageUrl',
      header: 'Preview',
      size: 80,
      cell: ({ getValue }) => (
        <img src={getValue() as string} alt="" className="h-10 w-16 rounded object-cover border border-warm-200" />
      ),
    },
    {
      accessorKey: 'altText',
      header: 'Descripción',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-warm-800">{row.original.altText ?? '—'}</p>
          <a href={row.original.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline truncate block max-w-[200px]">
            {row.original.linkUrl}
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'position',
      header: 'Posición',
      size: 180,
      cell: ({ getValue }) => (
        <Badge variant="info">{POSITION_LABELS[getValue() as BannerPosition]}</Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      size: 100,
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? 'success' : 'default'}>{getValue() ? 'Activo' : 'Inactivo'}</Badge>
      ),
    },
    {
      id: 'stats',
      header: 'Clicks / CTR',
      size: 120,
      cell: ({ row }) => (
        <span className="text-xs text-warm-500">
          {row.original.clickCount.toLocaleString('es-CL')} / {(row.original.ctr * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      accessorKey: 'displayOrder',
      header: 'Orden',
      size: 70,
      cell: ({ getValue }) => <span className="text-sm text-warm-500">{getValue() as number}</span>,
    },
    {
      id: 'actions',
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Can perform="banners:update">
            <button
              type="button"
              onClick={() => toggleActive.mutate({ id: row.original.id, isActive: !row.original.isActive })}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100"
              title={row.original.isActive ? 'Desactivar' : 'Activar'}
            >
              {row.original.isActive
                ? <ToggleRight size={14} className="text-success-600" />
                : <ToggleLeft size={14} />}
            </button>
            <Link
              to={ROUTES.BANNER_EDIT(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100"
            >
              <Pencil size={14} />
            </Link>
          </Can>
          <Can perform="banners:delete">
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

  const deletingBanner = data?.data.find((b) => b.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Banners"
        description="Gestiona los banners publicitarios del sitio."
        actions={
          <Can perform="banners:create">
            <Button onClick={() => navigate(ROUTES.BANNER_NEW)}>
              <Plus size={16} />
              Nuevo banner
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyTitle="Sin banners"
        emptyDescription="Crea tu primer banner publicitario."
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar banner"
        description={`¿Eliminar el banner "${deletingBanner?.altText ?? ''}"?`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
