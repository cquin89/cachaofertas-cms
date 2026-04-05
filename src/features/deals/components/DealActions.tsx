import { useState } from 'react';
import { MoreHorizontal, Star, StarOff, CheckCircle, XCircle, Archive, RotateCcw, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { cn } from '@/lib/utils';
import type { Deal } from '@/types/deal';
import type { useDealActions } from '../hooks/useDealActions';

type Actions = ReturnType<typeof useDealActions>;

interface DealActionsProps {
  deal: Deal;
  actions: Actions;
}

export function DealActions({ deal, actions }: DealActionsProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const isDeleted = !!deal.deletedAt;

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Acciones">
            <MoreHorizontal size={15} />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-dropdown min-w-[200px] overflow-hidden rounded-lg border border-warm-200 bg-surface-card p-1 shadow-lg animate-slide-down"
          >
            {/* Feature / Unfeature */}
            <Can perform="feature:deal">
              <DropdownMenu.Item
                onSelect={() => actions.featureDeal.mutate({ id: deal.id, isFeatured: !deal.isFeatured })}
                className={cn(itemCls, 'text-warning-700 focus:bg-warning-50')}
              >
                {deal.isFeatured
                  ? <><StarOff size={14} /> Quitar destacado</>
                  : <><Star size={14} /> Destacar oferta</>}
              </DropdownMenu.Item>
            </Can>

            <DropdownMenu.Separator className="my-1 h-px bg-warm-100" />

            {/* Cambiar status */}
            <Can perform="edit:deal_status">
              {deal.status !== 'active' && (
                <DropdownMenu.Item
                  onSelect={() => actions.changeStatus.mutate({ id: deal.id, status: 'active' })}
                  className={cn(itemCls, 'text-success-700 focus:bg-success-50')}
                >
                  <CheckCircle size={14} /> Activar
                </DropdownMenu.Item>
              )}
              {deal.status !== 'rejected' && (
                <DropdownMenu.Item
                  onSelect={() => actions.changeStatus.mutate({ id: deal.id, status: 'rejected' })}
                  className={cn(itemCls, 'text-danger-700 focus:bg-danger-50')}
                >
                  <XCircle size={14} /> Rechazar
                </DropdownMenu.Item>
              )}
              {deal.status !== 'expired' && (
                <DropdownMenu.Item
                  onSelect={() => actions.changeStatus.mutate({ id: deal.id, status: 'expired' })}
                  className={cn(itemCls, 'text-warm-600 focus:bg-warm-100')}
                >
                  <Archive size={14} /> Marcar expirada
                </DropdownMenu.Item>
              )}
            </Can>

            {/* Restaurar (solo si está eliminada) */}
            {isDeleted && (
              <Can perform="restore:deal">
                <DropdownMenu.Separator className="my-1 h-px bg-warm-100" />
                <DropdownMenu.Item
                  onSelect={() => setConfirmRestore(true)}
                  className={cn(itemCls, 'text-info-700 focus:bg-info-50')}
                >
                  <RotateCcw size={14} /> Restaurar
                </DropdownMenu.Item>
              </Can>
            )}

            {/* Eliminar */}
            {!isDeleted && (
              <Can perform="delete:deal">
                <DropdownMenu.Separator className="my-1 h-px bg-warm-100" />
                <DropdownMenu.Item
                  onSelect={() => setConfirmDelete(true)}
                  className={cn(itemCls, 'text-danger-600 focus:bg-danger-50')}
                >
                  <Trash2 size={14} /> Eliminar
                </DropdownMenu.Item>
              </Can>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Eliminar oferta?"
        description={`"${deal.title}" se eliminará. Puedes restaurarla después si eres admin.`}
        confirmLabel="Eliminar"
        loading={actions.deleteDeal.isPending}
        onConfirm={() => {
          actions.deleteDeal.mutate(deal.id);
          setConfirmDelete(false);
        }}
      />

      {/* Confirmar restaurar */}
      <ConfirmDialog
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title="¿Restaurar oferta?"
        description={`"${deal.title}" volverá a estar visible con su estado previo.`}
        confirmLabel="Restaurar"
        variant="primary"
        loading={actions.restoreDeal.isPending}
        onConfirm={() => {
          actions.restoreDeal.mutate(deal.id);
          setConfirmRestore(false);
        }}
      />
    </>
  );
}

const itemCls =
  'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none';
