import { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Can } from '@/components/shared/Can';
import { formatDate, timeAgo } from '@/lib/utils';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { Announcement, AnnouncementType, CreateAnnouncementRequest } from '@/types/cms';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';

const TYPE_CONFIG: Record<AnnouncementType, { label: string; variant: 'info' | 'warning' | 'success' | 'danger' }> = {
  info:    { label: 'Info',    variant: 'info'    },
  warning: { label: 'Aviso',   variant: 'warning' },
  success: { label: 'Éxito',   variant: 'success' },
  error:   { label: 'Error',   variant: 'danger'  },
};

const schema = z.object({
  title:    z.string().min(3),
  body:     z.string().min(5),
  type:     z.enum(['info', 'warning', 'success', 'error']),
  startsAt: z.string().min(1, 'Requerido'),
  endsAt:   z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<Announcement>>>('/admin/announcements?limit=100&page=0');
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '', type: 'info', startsAt: '', endsAt: '' },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: number; data: CreateAnnouncementRequest }) =>
      payload.id
        ? api.put(`/admin/announcements/${payload.id}`, payload.data)
        : api.post('/admin/announcements', payload.data),
    onSuccess: () => {
      toast.success(editingItem ? 'Anuncio actualizado' : 'Anuncio creado');
      qc.invalidateQueries({ queryKey: ['announcements'] });
      resetForm();
    },
    onError: (err) => handleMutationError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/announcements/${id}`),
    onSuccess: () => {
      toast.success('Anuncio eliminado');
      qc.invalidateQueries({ queryKey: ['announcements'] });
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.patch(`/admin/announcements/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });

  function resetForm() {
    reset();
    setShowForm(false);
    setEditingItem(null);
  }

  function startEdit(item: Announcement) {
    setEditingItem(item);
    setValue('title', item.title);
    setValue('body', item.body);
    setValue('type', item.type);
    setValue('startsAt', item.startsAt.slice(0, 16));
    setValue('endsAt', item.endsAt?.slice(0, 16) ?? '');
    setShowForm(true);
  }

  function onSubmit(data: FormData) {
    saveMutation.mutate({
      id: editingItem?.id,
      data: {
        title: data.title,
        body: data.body,
        type: data.type,
        startsAt: new Date(data.startsAt).toISOString(),
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
      },
    });
  }

  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-warm-800">{row.original.title}</p>
          <p className="text-xs text-warm-400 line-clamp-1">{row.original.body}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      size: 100,
      cell: ({ getValue }) => {
        const t = getValue() as AnnouncementType;
        const cfg = TYPE_CONFIG[t];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
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
      accessorKey: 'startsAt',
      header: 'Inicio',
      size: 140,
      cell: ({ getValue }) => <span className="text-xs text-warm-500">{formatDate(getValue() as string)}</span>,
    },
    {
      accessorKey: 'endsAt',
      header: 'Fin',
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-xs text-warm-500">
          {getValue() ? formatDate(getValue() as string) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Can perform="announcements:update">
            <button
              type="button"
              onClick={() => toggleActive.mutate({ id: row.original.id, isActive: !row.original.isActive })}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100"
            >
              {row.original.isActive ? <ToggleRight size={14} className="text-success-600" /> : <ToggleLeft size={14} />}
            </button>
            <button
              type="button"
              onClick={() => startEdit(row.original)}
              className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100"
            >
              <Pencil size={14} />
            </button>
          </Can>
          <Can perform="announcements:delete">
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

  const deletingAnn = data?.data.find((a) => a.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Anuncios del sitio"
        description="Banners de información que se muestran a los usuarios."
        actions={
          <Can perform="announcements:create">
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={16} />
              Nuevo anuncio
            </Button>
          </Can>
        }
      />

      {showForm && (
        <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">
            {editingItem ? 'Editar anuncio' : 'Nuevo anuncio'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <Input {...register('title')} placeholder="Título *" error={!!errors.title} />
              </div>
              <div>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </Select>
                  )}
                />
              </div>
            </div>
            <Textarea {...register('body')} placeholder="Cuerpo del anuncio *" rows={2} className="resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-warm-500">Inicio *</label>
                <Input {...register('startsAt')} type="datetime-local" error={!!errors.startsAt} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-warm-500">Fin (opcional)</label>
                <Input {...register('endsAt')} type="datetime-local" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={resetForm}>Cancelar</Button>
              <Button size="sm" type="submit" loading={saveMutation.isPending}>
                {editingItem ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyTitle="Sin anuncios"
        emptyDescription="Crea tu primer anuncio del sitio."
      />

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar anuncio"
        description={`¿Eliminar "${deletingAnn?.title}"?`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}
