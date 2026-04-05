import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/routes';
import { slugify } from '@/lib/utils';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { CmsPage, CreatePageRequest } from '@/types/cms';
import type { ApiResponse } from '@/types/api';

const schema = z.object({
  title:           z.string().min(2, 'Mínimo 2 caracteres').max(200),
  slug:            z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  content:         z.string().min(1, 'El contenido no puede estar vacío'),
  metaTitle:       z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished:     z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function PageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: page, isLoading } = useQuery({
    queryKey: ['cms-page', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CmsPage>>(`/admin/pages/${id}`);
      return res.data.data;
    },
    enabled: isEditing,
  });

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', slug: '', content: '', metaTitle: '', metaDescription: '', isPublished: false },
  });

  // Auto-slug from title (only when creating)
  const titleValue = watch('title');
  useEffect(() => {
    if (!isEditing) setValue('slug', slugify(titleValue));
  }, [titleValue, isEditing, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (page) {
      setValue('title', page.title);
      setValue('slug', page.slug);
      setValue('content', page.content);
      setValue('metaTitle', page.metaTitle ?? '');
      setValue('metaDescription', page.metaDescription ?? '');
      setValue('isPublished', page.isPublished);
    }
  }, [page, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: CreatePageRequest) =>
      isEditing
        ? api.put<ApiResponse<CmsPage>>(`/admin/pages/${id}`, data)
        : api.post<ApiResponse<CmsPage>>('/admin/pages', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Página actualizada' : 'Página creada');
      qc.invalidateQueries({ queryKey: ['cms-pages'] });
      navigate(ROUTES.PAGES);
    },
    onError: (err) => handleMutationError(err),
  });

  function onSubmit(data: FormData) {
    saveMutation.mutate({
      title: data.title,
      slug: data.slug,
      content: data.content,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      isPublished: data.isPublished,
    });
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditing ? 'Editar página' : 'Nueva página'}
        description={isEditing ? `Editando: ${page?.title ?? ''}` : 'Crea una nueva página estática.'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate(ROUTES.PAGES)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={saveMutation.isPending}
            >
              {isEditing ? 'Guardar cambios' : 'Crear página'}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Editor principal */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Título *</label>
              <Input
                {...register('title')}
                placeholder="Título de la página"
                error={!!errors.title}
              />
              {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-warm-700">Contenido *</label>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Escribe el contenido de la página…"
                  />
                )}
              />
              {errors.content && <p className="mt-1 text-xs text-danger-500">{errors.content.message}</p>}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            {/* Publicación */}
            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-display text-sm font-semibold text-warm-800">Publicación</h3>
              <div className="flex items-center justify-between">
                <label className="text-sm text-warm-600">Publicada</label>
                <Controller
                  control={control}
                  name="isPublished"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            {/* Slug */}
            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-display text-sm font-semibold text-warm-800">URL</h3>
              <div>
                <label className="mb-1 block text-xs text-warm-500">Slug *</label>
                <Input
                  {...register('slug')}
                  placeholder="mi-pagina"
                  error={!!errors.slug}
                  className="font-mono text-xs"
                />
                {errors.slug && <p className="mt-1 text-xs text-danger-500">{errors.slug.message}</p>}
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-display text-sm font-semibold text-warm-800">SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-warm-500">Meta título (máx. 70 chars)</label>
                  <Input
                    {...register('metaTitle')}
                    placeholder="Título para buscadores"
                    error={!!errors.metaTitle}
                  />
                  <p className="mt-0.5 text-right text-[10px] text-warm-400">
                    {watch('metaTitle')?.length ?? 0}/70
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-warm-500">Meta descripción (máx. 160 chars)</label>
                  <Textarea
                    {...register('metaDescription')}
                    placeholder="Descripción para buscadores"
                    rows={3}
                    className="resize-none"
                  />
                  <p className="mt-0.5 text-right text-[10px] text-warm-400">
                    {watch('metaDescription')?.length ?? 0}/160
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
