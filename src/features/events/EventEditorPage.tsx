import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/routes';
import { slugify } from '@/lib/utils';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { CommercialEvent, CreateEventRequest } from '@/types/cms';
import type { ApiResponse } from '@/types/api';

const schema = z.object({
  name:        z.string().min(2),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  bannerUrl:   z.string().optional(),
  isActive:    z.boolean(),
  startsAt:    z.string().min(1, 'Requerido'),
  endsAt:      z.string().min(1, 'Requerido'),
}).refine((d) => d.endsAt > d.startsAt, {
  message: 'La fecha de fin debe ser posterior al inicio',
  path: ['endsAt'],
});

type FormData = z.infer<typeof schema>;

export default function EventEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CommercialEvent>>(`/admin/events/${id}`);
      return res.data.data;
    },
    enabled: isEditing,
  });

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '', bannerUrl: '', isActive: true, startsAt: '', endsAt: '' },
  });

  const nameValue = watch('name');
  useEffect(() => {
    if (!isEditing) setValue('slug', slugify(nameValue));
  }, [nameValue, isEditing, setValue]);

  useEffect(() => {
    if (event) {
      setValue('name', event.name);
      setValue('slug', event.slug);
      setValue('description', event.description ?? '');
      setValue('bannerUrl', event.bannerUrl ?? '');
      setValue('isActive', event.isActive);
      setValue('startsAt', event.startsAt.slice(0, 16));
      setValue('endsAt', event.endsAt.slice(0, 16));
    }
  }, [event, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: CreateEventRequest) =>
      isEditing
        ? api.put(`/admin/events/${id}`, data)
        : api.post('/admin/events', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Evento actualizado' : 'Evento creado');
      qc.invalidateQueries({ queryKey: ['events'] });
      navigate(ROUTES.EVENTS);
    },
    onError: (err) => handleMutationError(err),
  });

  function onSubmit(data: FormData) {
    saveMutation.mutate({
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      bannerUrl: data.bannerUrl || undefined,
      isActive: data.isActive,
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
    });
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <div className="space-y-3"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditing ? 'Editar evento' : 'Nuevo evento'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate(ROUTES.EVENTS)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saveMutation.isPending}>
              {isEditing ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Nombre *</label>
              <Input {...register('name')} placeholder="Black Friday 2026" error={!!errors.name} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Slug</label>
              <Input {...register('slug')} className="font-mono text-xs" error={!!errors.slug} />
              {errors.slug && <p className="mt-1 text-xs text-danger-500">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Descripción</label>
              <Textarea {...register('description')} rows={3} className="resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Banner</label>
              <Controller
                control={control}
                name="bannerUrl"
                render={({ field }) => (
                  <ImageUploader value={field.value} onChange={field.onChange} className="h-36" />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm space-y-4">
              <h3 className="font-display text-sm font-semibold text-warm-800">Configuración</h3>
              <div className="flex items-center justify-between">
                <label className="text-sm text-warm-600">Activo</label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm space-y-3">
              <h3 className="font-display text-sm font-semibold text-warm-800">Período *</h3>
              <div>
                <label className="mb-1 block text-xs text-warm-500">Inicio</label>
                <Input {...register('startsAt')} type="datetime-local" error={!!errors.startsAt} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-warm-500">Fin</label>
                <Input {...register('endsAt')} type="datetime-local" error={!!errors.endsAt} />
                {errors.endsAt && <p className="mt-1 text-xs text-danger-500">{errors.endsAt.message}</p>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
