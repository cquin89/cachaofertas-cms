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
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { Banner, BannerPosition, CreateBannerRequest } from '@/types/cms';
import type { ApiResponse } from '@/types/api';

const POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: 'homepage_top',       label: 'Inicio — Top' },
  { value: 'category_sidebar',   label: 'Categoría — Sidebar' },
  { value: 'deal_detail_bottom', label: 'Oferta — Bottom' },
];

const schema = z.object({
  imageUrl:     z.string().url('URL de imagen requerida'),
  linkUrl:      z.string().url('URL de destino requerida'),
  altText:      z.string().max(200).optional(),
  position:     z.enum(['homepage_top', 'category_sidebar', 'deal_detail_bottom']),
  displayOrder: z.number().int().min(0),
  isActive:     z.boolean(),
  startsAt:     z.string().optional(),
  endsAt:       z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BannerEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: banner, isLoading } = useQuery({
    queryKey: ['banner', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Banner>>(`/admin/banners/${id}`);
      return res.data.data;
    },
    enabled: isEditing,
  });

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { imageUrl: '', linkUrl: '', altText: '', position: 'homepage_top', displayOrder: 0, isActive: true },
  });

  useEffect(() => {
    if (banner) {
      setValue('imageUrl', banner.imageUrl);
      setValue('linkUrl', banner.linkUrl);
      setValue('altText', banner.altText ?? '');
      setValue('position', banner.position);
      setValue('displayOrder', banner.displayOrder);
      setValue('isActive', banner.isActive);
      setValue('startsAt', banner.startsAt ?? '');
      setValue('endsAt', banner.endsAt ?? '');
    }
  }, [banner, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: CreateBannerRequest) =>
      isEditing
        ? api.put(`/admin/banners/${id}`, data)
        : api.post('/admin/banners', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Banner actualizado' : 'Banner creado');
      qc.invalidateQueries({ queryKey: ['banners'] });
      navigate(ROUTES.BANNERS);
    },
    onError: (err) => handleMutationError(err),
  });

  function onSubmit(data: FormData) {
    saveMutation.mutate({
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      altText: data.altText || undefined,
      position: data.position,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
      startsAt: data.startsAt || undefined,
      endsAt: data.endsAt || undefined,
    });
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-36 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditing ? 'Editar banner' : 'Nuevo banner'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate(ROUTES.BANNERS)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saveMutation.isPending}>
              {isEditing ? 'Guardar cambios' : 'Crear banner'}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {/* Imagen */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Imagen del banner *</label>
              <Controller
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <ImageUploader value={field.value} onChange={field.onChange} className="h-40" />
                )}
              />
              {errors.imageUrl && <p className="mt-1 text-xs text-danger-500">{errors.imageUrl.message}</p>}
            </div>

            {/* URL destino */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">URL de destino *</label>
              <Input {...register('linkUrl')} placeholder="https://..." error={!!errors.linkUrl} />
              {errors.linkUrl && <p className="mt-1 text-xs text-danger-500">{errors.linkUrl.message}</p>}
            </div>

            {/* Alt text */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Texto alternativo</label>
              <Input {...register('altText')} placeholder="Descripción de la imagen" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Configuración */}
            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm space-y-4">
              <h3 className="font-display text-sm font-semibold text-warm-800">Configuración</h3>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-warm-700">Posición *</label>
                <Controller
                  control={control}
                  name="position"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      {POSITIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-warm-700">Orden de visualización</label>
                <Input
                  {...register('displayOrder', { valueAsNumber: true })}
                  type="number"
                  min={0}
                />
              </div>

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

            {/* Fechas */}
            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm space-y-3">
              <h3 className="font-display text-sm font-semibold text-warm-800">Programación (opcional)</h3>
              <div>
                <label className="mb-1 block text-xs text-warm-500">Inicio</label>
                <Input {...register('startsAt')} type="datetime-local" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-warm-500">Fin</label>
                <Input {...register('endsAt')} type="datetime-local" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
