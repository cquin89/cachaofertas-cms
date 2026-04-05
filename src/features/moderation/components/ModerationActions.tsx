import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, AlertTriangle, ShieldBan, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Can } from '@/components/shared/Can';
import type { ModerationAction, ModerationItemType } from '@/types/moderation';

interface ModerationActionsProps {
  itemId: number;
  entityType: ModerationItemType;
  loading: boolean;
  onAction: (id: number, action: ModerationAction, reason?: string) => void;
  /** Shortcuts activos: A=aprobar, R=rechazar */
  showShortcuts?: boolean;
}

export function ModerationActions({
  itemId, entityType, loading, onAction, showShortcuts,
}: ModerationActionsProps) {
  const [pendingAction, setPendingAction] = useState<'warn' | 'ban' | null>(null);
  const [reason, setReason] = useState('');

  function submit(action: ModerationAction) {
    onAction(itemId, action, reason || undefined);
    setPendingAction(null);
    setReason('');
  }

  if (pendingAction) {
    return (
      <div className="flex flex-col gap-2 pt-2 border-t border-warm-100">
        <p className="text-xs font-medium text-warm-600">
          {pendingAction === 'warn' ? 'Motivo de advertencia:' : 'Motivo del baneo:'}
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe el motivo..."
          className="min-h-[60px] text-xs"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={pendingAction === 'ban' ? 'destructive' : 'primary'}
            loading={loading}
            disabled={!reason.trim()}
            onClick={() => submit(pendingAction)}
          >
            Confirmar {pendingAction === 'ban' ? 'baneo' : 'advertencia'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setPendingAction(null); setReason(''); }}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-warm-100">
      {/* Aprobar */}
      <Button
        size="sm"
        variant="ghost"
        className="text-success-700 hover:bg-success-50"
        loading={loading}
        onClick={() => onAction(itemId, 'approve')}
        title="Aprobar (A)"
      >
        <CheckCircle size={14} />
        Aprobar
        {showShortcuts && <Kbd>A</Kbd>}
      </Button>

      {/* Rechazar */}
      <Button
        size="sm"
        variant="ghost"
        className="text-danger-700 hover:bg-danger-50"
        loading={loading}
        onClick={() => onAction(itemId, 'reject')}
        title="Rechazar (R)"
      >
        <XCircle size={14} />
        Rechazar
        {showShortcuts && <Kbd>R</Kbd>}
      </Button>

      {/* Eliminar — solo admins */}
      <Can perform="delete:deal">
        <Button
          size="sm"
          variant="ghost"
          className="text-danger-600 hover:bg-danger-50"
          loading={loading}
          onClick={() => onAction(itemId, 'delete')}
        >
          <Trash2 size={14} />
          Eliminar
        </Button>
      </Can>

      {/* Advertir usuario — para deals y usuarios */}
      {(entityType === 'deal' || entityType === 'user') && (
        <Can perform="warn:user">
          <Button
            size="sm"
            variant="ghost"
            className="text-warning-700 hover:bg-warning-50"
            onClick={() => setPendingAction('warn')}
          >
            <AlertTriangle size={14} />
            Advertir
          </Button>
        </Can>
      )}

      {/* Banear — para deals (banear al autor) y usuarios */}
      {(entityType === 'deal' || entityType === 'user') && (
        <Can perform="ban:user">
          <Button
            size="sm"
            variant="ghost"
            className="text-danger-700 hover:bg-danger-50"
            onClick={() => setPendingAction('ban')}
          >
            <ShieldBan size={14} />
            Banear
          </Button>
        </Can>
      )}

      {/* Ignorar */}
      <Button
        size="sm"
        variant="ghost"
        className="text-warm-400 hover:bg-warm-100"
        loading={loading}
        onClick={() => onAction(itemId, 'ignore')}
      >
        <MinusCircle size={14} />
        Ignorar
      </Button>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="ml-0.5 rounded border border-warm-200 bg-warm-100 px-1 py-0.5 font-mono text-xs text-warm-500">
      {children}
    </kbd>
  );
}
