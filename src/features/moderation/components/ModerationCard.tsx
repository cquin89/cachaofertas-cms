import { Link } from 'react-router-dom';
import { Flag, ExternalLink, User, MessageSquare } from 'lucide-react';
import { ModerationActions } from './ModerationActions';
import { TempBadge } from '@/components/shared/TempBadge';
import { Badge } from '@/components/ui/Badge';
import { cn, timeAgo, formatCLP, truncate } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import type { ModerationItem, ModerationAction } from '@/types/moderation';

const REASON_LABELS: Record<string, string> = {
  wrong_price:   'Precio incorrecto',
  expired:       'Oferta expirada',
  duplicate:     'Duplicado',
  spam:          'Spam',
  inappropriate: 'Contenido inapropiado',
  misleading:    'Información engañosa',
  other:         'Otro',
};

interface ModerationCardProps {
  item: ModerationItem;
  isFocused: boolean;
  isLoading: boolean;
  onFocus: () => void;
  onAction: (id: number, action: ModerationAction, reason?: string) => void;
  showShortcuts: boolean;
}

export function ModerationCard({
  item, isFocused, isLoading, onFocus, onAction, showShortcuts,
}: ModerationCardProps) {
  const entity = item.entity;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm transition-all duration-150 cursor-pointer',
        isFocused
          ? 'border-primary-400 ring-2 ring-primary-500/20'
          : 'border-warm-200 hover:border-warm-300 hover:shadow-md'
      )}
      onClick={onFocus}
      tabIndex={0}
      onFocus={onFocus}
    >
      <div className="p-4">
        {/* Header: reporte meta */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-warm-400">
          <Flag size={11} className="text-danger-400 shrink-0" />
          <span className="font-medium text-warm-600">
            {item.reportCount} reporte{item.reportCount > 1 ? 's' : ''}
          </span>
          <span>·</span>
          <Badge variant="danger" className="text-xs py-0 px-1.5">
            {REASON_LABELS[item.reportReason] ?? item.reportReason}
          </Badge>
          <span>·</span>
          <span>{timeAgo(item.createdAt)}</span>
          {item.reporterNote && (
            <>
              <span>·</span>
              <span className="italic text-warm-500">
                "{truncate(item.reporterNote, 80)}"
              </span>
            </>
          )}
        </div>

        {/* Contenido según tipo */}
        {entity.kind === 'deal' && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={ROUTES.DEAL_DETAIL(entity.id)}
                className="font-display font-semibold text-warm-900 hover:text-primary-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {entity.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-warm-500">
                <span className="flex items-center gap-1">
                  <User size={10} />
                  @{entity.authorUsername}
                </span>
                {entity.price !== null && (
                  <span className="font-medium text-warm-700">{formatCLP(entity.price)}</span>
                )}
                <span className="font-mono text-warm-400">ID: {entity.id}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <TempBadge temperature={entity.temperature} />
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-300 hover:text-warm-500"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}

        {entity.kind === 'comment' && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-warm-500">
              <MessageSquare size={12} />
              <span>
                Comentario de <span className="font-medium text-warm-700">@{entity.authorUsername}</span>
                {' en '}
                <Link
                  to={ROUTES.DEAL_DETAIL(entity.dealId)}
                  className="text-primary-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {truncate(entity.dealTitle, 40)}
                </Link>
              </span>
            </div>
            <blockquote className="rounded-md border-l-2 border-warm-300 bg-warm-50 px-3 py-2 text-sm text-warm-700 italic">
              "{truncate(entity.body, 200)}"
            </blockquote>
          </div>
        )}

        {entity.kind === 'user' && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <User size={18} className="text-primary-500" />
            </div>
            <div>
              <Link
                to={ROUTES.USER_DETAIL(entity.id)}
                className="font-semibold text-warm-900 hover:text-primary-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                @{entity.username}
              </Link>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-warm-400">
                <span>{entity.email}</span>
                <span>{entity.reputation} rep.</span>
                {entity.isBanned && (
                  <Badge variant="danger">Baneado</Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <ModerationActions
          itemId={item.id}
          entityType={item.type}
          loading={isLoading}
          onAction={onAction}
          showShortcuts={isFocused && showShortcuts}
        />
      </div>
    </div>
  );
}
