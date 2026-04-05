import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/shared/SearchInput';
import { Can } from '@/components/shared/Can';
import { formatDate, timeAgo } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import type { CmsPage } from '@/types/cms';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';

export default function PagesListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-pages', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50', page: '0' });
      if (search) params.set('search', search);
      const res = await api.get<ApiResponse<PageResponse<CmsPage>>>(`/admin/pages?${params}`);
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/pages/${id}`),
    onSuccess: () => {
      toast.success('Página eliminada');
      qc.invalidateQueries({ queryKey: ['cms-pages'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar la página'),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      api.patch<ApiResponse<CmsPage>>(`/admin/pages/${id}`, { isPublished }),
    onSuccess: (_, { isPublished }) => {
      toast.success(isPublished ? 'Página publicada' : 'Página despublicada');
      qc.invalidateQueries({ queryKey: ['cms-pages'] });
    },
    onError: () => toast.error('Error al cambiar el estado'),
  });

  const columns: ColumnDef<CmsPage>[] = [
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => (
        <div>
          <Link
            to={ROUTES.PAGE_EDIT(row.original.id)}
            className="font-medium text-warm-800 hover:text-primary-600 hover:underline"
          >
            {row.original.title}
          </Link>
          <p className="text-xs text-warm-400 mt-0.5">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'isPublished',
      header: 'Estado',
      size: 120,
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? 'success' : 'default'}>
          {getValue() ? 'Publicada' : 'Borrador'}
        </Badge>
      ),
    },
    {
      accessorKey: 'authorUsername',
      header: 'Autor',
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-sm text-warm-600">@{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Actualizada',
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-xs text-warm-400">{timeAgo(getValue() as string)}</span>
      ),
    },
    {
      id: 'actions',
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Can perform="pages:publish">
            <button
              type="button"
              onClick={() => togglePublish.mutate({ id: row.original.id, isPublished: !row.original.isPublished })}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100 hover:text-warm-700"
              title={row.original.isPublished ? 'Despublicar' : 'Publicar'}
            >
              {row.original.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </Can>
          <Can perform="pages:update">
            <Link
              to={ROUTES.PAGE_EDIT(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100 hover:text-warm-700"
            >
              <Pencil size={14} />
            </Link>
          </Can>
          <Can perform="pages:delete">
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

  const deletingPage = data?.data.find((p) => p.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Páginas"
        description="Gestiona las páginas estáticas del sitio."
        actions={
          <Can perform="pages:create">
            <Button onClick={() => navigate(ROUTES.PAGE_NEW)}>
              <Plus size={16} />
              Nueva página
            </Button>
          </Can>
        }
      />

      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar páginas…"
          className="max-w-xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyTitle="Sin páginas"
        emptyDescription="Crea tu primera página estática."
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar página"
        description={`¿Eliminar "${deletingPage?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
