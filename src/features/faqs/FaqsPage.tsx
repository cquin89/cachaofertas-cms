import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { Can } from '@/components/shared/Can';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { Faq, CreateFaqRequest } from '@/types/cms';
import type { ApiResponse, PageResponse } from '@/types/api';

const schema = z.object({
  question: z.string().min(5, 'Mínimo 5 caracteres'),
  answer:   z.string().min(10, 'Mínimo 10 caracteres'),
  category: z.string().min(1, 'Requerido'),
});
type FormData = z.infer<typeof schema>;

export default function FaqsPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<Faq>>>('/admin/faqs?limit=200&page=0');
      return res.data.data.data;
    },
    staleTime: 60_000,
  });

  const [localItems, setLocalItems] = useState<Faq[]>([]);
  const items = localItems.length > 0 ? localItems : (data ?? []);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { question: '', answer: '', category: 'General' },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: number; data: CreateFaqRequest }) =>
      payload.id
        ? api.put(`/admin/faqs/${payload.id}`, payload.data)
        : api.post('/admin/faqs', payload.data),
    onSuccess: () => {
      toast.success(editingId ? 'FAQ actualizada' : 'FAQ creada');
      qc.invalidateQueries({ queryKey: ['faqs'] });
      setLocalItems([]);
      reset();
      setShowForm(false);
      setEditingId(null);
    },
    onError: (err) => handleMutationError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/faqs/${id}`),
    onSuccess: () => {
      toast.success('FAQ eliminada');
      qc.invalidateQueries({ queryKey: ['faqs'] });
      setLocalItems([]);
      setDeletingId(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: number; displayOrder: number }>) =>
      api.put('/admin/faqs/reorder', { items }),
    onError: () => {
      toast.error('Error al reordenar');
      setLocalItems([]);
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));
    setLocalItems(reordered);
    reorderMutation.mutate(reordered.map((i) => ({ id: i.id, displayOrder: i.displayOrder })));
  }

  function startEdit(faq: Faq) {
    setEditingId(faq.id);
    setValue('question', faq.question);
    setValue('answer', faq.answer);
    setValue('category', faq.category);
    setShowForm(true);
  }

  function onSubmit(data: FormData) {
    saveMutation.mutate({ id: editingId ?? undefined, data });
  }

  const deletingFaq = items.find((f) => f.id === deletingId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="FAQs"
        description="Preguntas frecuentes — arrastra para reordenar."
        actions={
          <Can perform="faqs:create">
            <Button onClick={() => { setShowForm(true); setEditingId(null); reset(); }}>
              <Plus size={16} />
              Nueva FAQ
            </Button>
          </Can>
        }
      />

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">
            {editingId ? 'Editar FAQ' : 'Nueva FAQ'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <Input {...register('question')} placeholder="Pregunta *" error={!!errors.question} />
                {errors.question && <p className="mt-0.5 text-xs text-danger-500">{errors.question.message}</p>}
              </div>
              <div>
                <Input {...register('category')} placeholder="Categoría" />
              </div>
            </div>
            <div>
              <Textarea {...register('answer')} placeholder="Respuesta *" rows={3} className="resize-none" />
              {errors.answer && <p className="mt-0.5 text-xs text-danger-500">{errors.answer.message}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>
                Cancelar
              </Button>
              <Button size="sm" type="submit" loading={saveMutation.isPending}>
                {editingId ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" rounded="lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-warm-400">
          <p className="font-display text-sm">No hay FAQs aún</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((faq) => (
                <SortableFaqRow
                  key={faq.id}
                  faq={faq}
                  expanded={expandedId === faq.id}
                  onToggle={() => setExpandedId((prev) => (prev === faq.id ? null : faq.id))}
                  onEdit={() => startEdit(faq)}
                  onDelete={() => setDeletingId(faq.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="Eliminar FAQ"
        description={`¿Eliminar "${deletingFaq?.question}"?`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}

interface SortableFaqRowProps {
  faq: Faq;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableFaqRow({ faq, expanded, onToggle, onEdit, onDelete }: SortableFaqRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: faq.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-lg border border-warm-200 bg-white shadow-sm overflow-hidden',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-warm-300 hover:text-warm-500 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="font-medium text-sm text-warm-800">{faq.question}</span>
          <span className="ml-auto flex-shrink-0 rounded-full bg-warm-100 px-2 py-0.5 text-xs text-warm-500">
            {faq.category}
          </span>
          {expanded ? <ChevronDown size={14} className="text-warm-400" /> : <ChevronRight size={14} className="text-warm-400" />}
        </button>

        <div className="flex items-center gap-1 ml-2">
          <Can perform="faqs:update">
            <button type="button" onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-warm-100">
              <Pencil size={13} />
            </button>
          </Can>
          <Can perform="faqs:delete">
            <button type="button" onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-danger-50 hover:text-danger-600">
              <Trash2 size={13} />
            </button>
          </Can>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-warm-100 bg-warm-50 px-4 py-3">
          <p className="text-sm text-warm-700">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}
