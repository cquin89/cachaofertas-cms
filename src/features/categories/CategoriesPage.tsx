import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, ChevronRight, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Can } from '@/components/shared/Can';
import { cn, slugify } from '@/lib/utils';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { Category, CreateCategoryRequest } from '@/types/analytics';
import type { ApiResponse } from '@/types/api';

const schema = z.object({
  name:     z.string().min(2),
  slug:     z.string().min(2).regex(/^[a-z0-9-]+$/),
  icon:     z.string().optional(),
  parentId: z.number().nullable(),
});
type FormData = z.infer<typeof schema>;

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [localFlat, setLocalFlat] = useState<Category[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/admin/categories');
      return res.data.data;
    },
    staleTime: 60_000,
  });

  // Flatten tree for drag & drop
  const flat = localFlat.length > 0 ? localFlat : flattenTree(data ?? []);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', icon: '', parentId: null },
  });

  const nameValue = watch('name');

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: number; data: CreateCategoryRequest }) =>
      payload.id
        ? api.put(`/admin/categories/${payload.id}`, payload.data)
        : api.post('/admin/categories', payload.data),
    onSuccess: () => {
      toast.success(editingItem ? 'Categoría actualizada' : 'Categoría creada');
      qc.invalidateQueries({ queryKey: ['categories'] });
      setLocalFlat([]);
      resetForm();
    },
    onError: (err) => handleMutationError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Categoría eliminada');
      qc.invalidateQueries({ queryKey: ['categories'] });
      setLocalFlat([]);
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: number; displayOrder: number }>) =>
      api.put('/admin/categories/reorder', { items }),
    onError: () => {
      toast.error('Error al reordenar');
      setLocalFlat([]);
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = flat.findIndex((c) => c.id === active.id);
    const newIndex = flat.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(flat, oldIndex, newIndex).map((c, i) => ({ ...c, displayOrder: i + 1 }));
    setLocalFlat(reordered);
    reorderMutation.mutate(reordered.map((c) => ({ id: c.id, displayOrder: c.displayOrder })));
  }

  function startEdit(cat: Category) {
    setEditingItem(cat);
    setValue('name', cat.name);
    setValue('slug', cat.slug);
    setValue('icon', cat.icon ?? '');
    setValue('parentId', cat.parentId ?? null);
    setShowForm(true);
  }

  function resetForm() {
    reset();
    setShowForm(false);
    setEditingItem(null);
  }

  function onSubmit(data: FormData) {
    saveMutation.mutate({
      id: editingItem?.id,
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || undefined,
        parentId: data.parentId ?? undefined,
      },
    });
  }

  // Root categories (for parent selector — exclude self and its children)
  const rootOptions = flat.filter((c) => !c.parentId && c.id !== editingItem?.id);
  const deletingCat = flat.find((c) => c.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categorías"
        description="Gestiona la jerarquía de categorías — arrastra para reordenar."
        actions={
          <Can perform="categories:create">
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={16} />
              Nueva categoría
            </Button>
          </Can>
        }
      />

      {showForm && (
        <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">
            {editingItem ? 'Editar categoría' : 'Nueva categoría'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Input
                  {...register('name')}
                  placeholder="Nombre *"
                  error={!!errors.name}
                  onChange={(e) => {
                    register('name').onChange(e);
                    if (!editingItem) setValue('slug', slugify(e.target.value));
                  }}
                />
              </div>
              <div>
                <Input {...register('slug')} placeholder="slug" className="font-mono text-xs" error={!!errors.slug} />
              </div>
              <div>
                <Input {...register('icon')} placeholder="Emoji o código icono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-warm-500">Categoría padre (opcional)</label>
                <Select
                  value={watch('parentId')?.toString() ?? ''}
                  onValueChange={(v) => setValue('parentId', v ? Number(v) : null)}
                >
                  <option value="">Sin padre (raíz)</option>
                  {rootOptions.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={resetForm}>Cancelar</Button>
                <Button size="sm" type="submit" loading={saveMutation.isPending}>
                  {editingItem ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" rounded="lg" />)}
        </div>
      ) : flat.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-warm-400">
          <FolderOpen size={40} />
          <p className="mt-3 font-display text-sm">No hay categorías aún</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={flat.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {flat.map((cat) => (
                <SortableCategoryRow
                  key={cat.id}
                  cat={cat}
                  onEdit={() => startEdit(cat)}
                  onDelete={() => setDeletingId(cat.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar categoría"
        description={`¿Eliminar "${deletingCat?.name}"? Las subcategorías quedarán sin padre.`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}

function flattenTree(cats: Category[]): Category[] {
  const result: Category[] = [];
  function walk(items: Category[]) {
    for (const item of items) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  }
  walk(cats);
  return result;
}

interface SortableCategoryRowProps {
  cat: Category;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableCategoryRow({ cat, onEdit, onDelete }: SortableCategoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-warm-200 bg-white px-4 py-2.5 shadow-sm',
        cat.parentId && 'ml-8 border-warm-100',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-warm-300 hover:text-warm-500">
        <GripVertical size={15} />
      </button>

      {cat.parentId && <ChevronRight size={12} className="text-warm-300" />}

      {cat.icon && <span className="text-lg leading-none">{cat.icon}</span>}

      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm text-warm-800">{cat.name}</span>
        <span className="ml-2 font-mono text-xs text-warm-400">/{cat.slug}</span>
      </div>

      <span className="text-xs text-warm-400">{cat.dealCount} ofertas</span>

      <div className="flex items-center gap-1">
        <Can perform="categories:update">
          <button type="button" onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100">
            <Pencil size={13} />
          </button>
        </Can>
        <Can perform="categories:delete">
          <button type="button" onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-danger-50 hover:text-danger-600">
            <Trash2 size={13} />
          </button>
        </Can>
      </div>
    </div>
  );
}
