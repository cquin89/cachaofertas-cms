import { useState } from 'react';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import type { useDealActions } from '../hooks/useDealActions';

interface BulkDealActionsProps {
  selectedIds: number[];
  actions: ReturnType<typeof useDealActions>;
  onClearSelection: () => void;
}

export function BulkDealActions({ selectedIds, actions, onClearSelection }: BulkDealActionsProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleBulkStatus(status: 'active' | 'rejected') {
    actions.bulkChangeStatus.mutate(
      { ids: selectedIds, status },
      { onSuccess: onClearSelection }
    );
  }

  return (
    <>
      <Can perform="edit:deal_status">
        <Button
          variant="ghost"
          size="sm"
          className="text-success-700 hover:bg-success-50"
          loading={actions.bulkChangeStatus.isPending}
          onClick={() => handleBulkStatus('active')}
        >
          <CheckCircle size={13} />
          Activar ({selectedIds.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-danger-700 hover:bg-danger-50"
          loading={actions.bulkChangeStatus.isPending}
          onClick={() => handleBulkStatus('rejected')}
        >
          <XCircle size={13} />
          Rechazar ({selectedIds.length})
        </Button>
      </Can>

      <Can perform="delete:deal">
        <Button
          variant="ghost"
          size="sm"
          className="text-danger-700 hover:bg-danger-50"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={13} />
          Eliminar ({selectedIds.length})
        </Button>
      </Can>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`¿Eliminar ${selectedIds.length} ofertas?`}
        description="Esta acción eliminará todas las ofertas seleccionadas. Pueden restaurarse si eres admin."
        confirmLabel={`Eliminar ${selectedIds.length}`}
        loading={actions.bulkDelete.isPending}
        onConfirm={() => {
          actions.bulkDelete.mutate(selectedIds, {
            onSuccess: () => { onClearSelection(); setConfirmDelete(false); },
          });
        }}
      />
    </>
  );
}
