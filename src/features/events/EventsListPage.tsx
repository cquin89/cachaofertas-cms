import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/shared/SearchInput';
import { Can } from '@/components/shared/Can';
import { formatDateShort } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import type { CommercialEvent } from '@/types/cms';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';

export default function EventsListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['events', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50', page: '0' });
      if (search) params.set('search', search);
      const res = await api.get<ApiResponse<PageResponse<CommercialEvent>>>(`/admin/events?${params}`);
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/events/${id}`),
    onSuccess: () => {
      toast.success('Evento eliminado');
      qc.invalidateQueries({ queryKey: ['events'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar el evento'),
  });

  function isOngoing(event: CommercialEvent) {
    const now = new Date();
    return new Date(event.startsAt) <= now && new Date(event.endsAt) >= now;
  }

  const columns: ColumnDef<CommercialEvent>[] = [
    {
      accessorKey: 'name',
      header: 'Evento',
      cell: ({ row }) => (
        <div>
          <Link
            to={ROUTES.EVENT_EDIT(row.original.id)}
            className="font-medium text-warm-800 hover:text-primary-600 hover:underline"
          >
            {row.original.name}
          </Link>
          <p className="text-xs text-warm-400 mt-0.5">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      size: 110,
      cell: ({ row }) => {
        const now = new Date();
        const started = new Date(row.original.startsAt) <= now;
        const ended   = new Date(row.original.endsAt) < now;
        if (!row.original.isActive) return <Badge variant="default">Inactivo</Badge>;
        if (ended)   return <Badge variant="default">Finalizado</Badge>;
        if (started) return <Badge variant="success">En curso</Badge>;
        return <Badge variant="info">Próximo</Badge>;
      },
    },
    {
      accessorKey: 'dealCount',
      header: 'Ofertas',
      size: 80,
      cell: ({ getValue }) => (
        <span className="text-sm text-warm-600">{getValue() as number}</span>
      ),
    },
    {
      id: 'period',
      header: 'Período',
      size: 200,
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-xs text-warm-500">
          <Calendar size={11} />
          {formatDateShort(row.original.startsAt)} — {formatDateShort(row.original.endsAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      size: 80,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Can perform="events:update">
            <Link
              to={ROUTES.EVENT_EDIT(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100"
            >
              <Pencil size={14} />
            </Link>
          </Can>
          <Can perform="events:delete">
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

  const deletingEvent = data?.data.find((e) => e.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Eventos comerciales"
        description="Black Friday, CyberMonday, Navidad y otros eventos."
        actions={
          <Can perform="events:create">
            <Button onClick={() => navigate(ROUTES.EVENT_NEW)}>
              <Plus size={16} />
              Nuevo evento
            </Button>
          </Can>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar eventos…" className="max-w-xs" />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyTitle="Sin eventos"
        emptyDescription="Crea tu primer evento comercial."
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar evento"
        description={`¿Eliminar "${deletingEvent?.name}"?`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
