import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Can } from '@/components/shared/Can';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { Store, AffiliateNetwork, CreateAffiliateProgramRequest } from '@/types/affiliate';
import type { ApiResponse } from '@/types/api';

const NETWORKS: AffiliateNetwork[] = ['cj', 'awin', 'impact', 'partnerize', 'custom'];

const storeSchema = z.object({
  name:    z.string().min(2),
  domain:  z.string().min(3),
  logoUrl: z.string().optional(),
});
type StoreFormData = z.infer<typeof storeSchema>;

const affiliateSchema = z.object({
  network:              z.enum(['cj', 'awin', 'impact', 'partnerize', 'custom']),
  trackingUrlTemplate:  z.string().min(5),
  commissionPercent:    z.number().min(0).max(100).optional(),
  cookieDays:           z.number().int().min(0).optional(),
  isActive:             z.boolean(),
});
type AffiliateFormData = z.infer<typeof affiliateSchema>;

export default function StoreEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showAffForm, setShowAffForm] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Store>>(`/admin/stores/${id}`);
      return res.data.data;
    },
    enabled: isEditing,
  });

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: '', domain: '', logoUrl: '' },
  });

  const affForm = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: { network: 'cj', trackingUrlTemplate: '', commissionPercent: undefined, cookieDays: 30, isActive: true },
  });

  useEffect(() => {
    if (store) {
      setValue('name', store.name);
      setValue('domain', store.domain);
      setValue('logoUrl', store.logoUrl ?? '');
    }
  }, [store, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: StoreFormData) =>
      isEditing
        ? api.put(`/admin/stores/${id}`, data)
        : api.post('/admin/stores', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Tienda actualizada' : 'Tienda creada');
      qc.invalidateQueries({ queryKey: ['stores'] });
      navigate(ROUTES.STORES);
    },
    onError: (err) => handleMutationError(err),
  });

  const addAffiliate = useMutation({
    mutationFn: (data: CreateAffiliateProgramRequest) =>
      api.post(`/admin/stores/${id}/affiliate-programs`, data),
    onSuccess: () => {
      toast.success('Programa de afiliación añadido');
      qc.invalidateQueries({ queryKey: ['store', id] });
      setShowAffForm(false);
      affForm.reset();
    },
    onError: (err) => handleMutationError(err),
  });

  const deleteAffiliate = useMutation({
    mutationFn: (affId: number) => api.delete(`/admin/stores/${id}/affiliate-programs/${affId}`),
    onSuccess: () => {
      toast.success('Programa eliminado');
      qc.invalidateQueries({ queryKey: ['store', id] });
    },
  });

  function onSubmit(data: StoreFormData) {
    saveMutation.mutate({ ...data, logoUrl: data.logoUrl || undefined });
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditing ? 'Editar tienda' : 'Nueva tienda'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate(ROUTES.STORES)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saveMutation.isPending}>
              {isEditing ? 'Guardar cambios' : 'Crear tienda'}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Nombre *</label>
              <Input {...register('name')} placeholder="Amazon" error={!!errors.name} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Dominio *</label>
              <Input {...register('domain')} placeholder="amazon.cl" error={!!errors.domain} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-warm-700">Logo</label>
            <Controller
              control={control}
              name="logoUrl"
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} className="h-28" />
              )}
            />
          </div>
        </div>
      </form>

      {/* Affiliate programs — solo en modo edición */}
      {isEditing && (
        <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-semibold text-warm-800">Programas de afiliación</h3>
            <Can perform="stores:update">
              <Button variant="outline" size="sm" onClick={() => setShowAffForm(true)}>
                <Plus size={13} />
                Añadir
              </Button>
            </Can>
          </div>

          {showAffForm && (
            <form
              onSubmit={affForm.handleSubmit((d) => addAffiliate.mutate({
                network: d.network,
                trackingUrlTemplate: d.trackingUrlTemplate,
                commissionPercent: d.commissionPercent,
                cookieDays: d.cookieDays,
                isActive: d.isActive,
              }))}
              className="mb-4 rounded-lg border border-warm-100 bg-warm-50 p-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-warm-500">Red</label>
                  <Controller
                    control={affForm.control}
                    name="network"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        {NETWORKS.map((n) => (
                          <option key={n} value={n}>{n.toUpperCase()}</option>
                        ))}
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-warm-500">Comisión %</label>
                  <Input {...affForm.register('commissionPercent', { valueAsNumber: true })} type="number" step="0.1" min={0} max={100} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-warm-500">URL de tracking *</label>
                <Input {...affForm.register('trackingUrlTemplate')} placeholder="https://track.example.com?url={url}" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-warm-500">Cookie días:</label>
                  <Input {...affForm.register('cookieDays', { valueAsNumber: true })} type="number" min={0} className="w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setShowAffForm(false)}>Cancelar</Button>
                  <Button size="sm" type="submit" loading={addAffiliate.isPending}>Añadir</Button>
                </div>
              </div>
            </form>
          )}

          {!store?.affiliatePrograms.length ? (
            <p className="text-sm text-warm-400">Sin programas de afiliación.</p>
          ) : (
            <div className="space-y-2">
              {store.affiliatePrograms.map((prog) => (
                <div key={prog.id} className="flex items-center gap-3 rounded-lg border border-warm-100 bg-warm-50 px-3 py-2">
                  <Badge variant="info">{prog.network.toUpperCase()}</Badge>
                  <span className="flex-1 text-xs font-mono text-warm-600 truncate">{prog.trackingUrlTemplate}</span>
                  {prog.commissionPercent && (
                    <span className="text-xs text-warm-500">{prog.commissionPercent}%</span>
                  )}
                  <Badge variant={prog.isActive ? 'success' : 'default'}>{prog.isActive ? 'Activo' : 'Inactivo'}</Badge>
                  <Can perform="stores:update">
                    <button
                      type="button"
                      onClick={() => deleteAffiliate.mutate(prog.id)}
                      className="flex h-6 w-6 items-center justify-center rounded text-warm-400 hover:bg-danger-50 hover:text-danger-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Can>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
