import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink } from 'lucide-react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/DataTable';
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader';
import { DealStatusBadge } from '@/components/shared/StatusBadge';
import { TempBadge } from '@/components/shared/TempBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { DealActions } from './DealActions';
import { BulkDealActions } from './BulkDealActions';
import { formatCLP, formatDate, truncate } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import type { Deal } from '@/types/deal';
import type { useDealActions } from '../hooks/useDealActions';

interface DealsTableProps {
  data: Deal[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  selectedRows: RowSelectionState;
  onRowSelectionChange: (s: RowSelectionState) => void;
  actions: ReturnType<typeof useDealActions>;
}

export function DealsTable({
  data, total, loading, page, pageSize,
  onPageChange, onPageSizeChange,
  selectedRows, onRowSelectionChange, actions,
}: DealsTableProps) {
  const columns = useMemo<ColumnDef<Deal, unknown>[]>(() => [
    {
      id: 'deal',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oferta" />,
      accessorFn: (row) => row.title,
      cell: ({ row }) => {
        const deal = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0 max-w-sm">
            {/* Thumbnail */}
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-warm-100">
              {deal.imageUrl
                ? <img src={deal.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                : <span className="flex h-full w-full items-center justify-center text-warm-300 text-xs">IMG</span>
              }
            </div>
            <div className="min-w-0">
              <Link
                to={ROUTES.DEAL_DETAIL(deal.id)}
                className="block truncate text-sm font-medium text-warm-800 hover:text-primary-600 hover:underline"
              >
                {truncate(deal.title, 60)}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                {deal.store && (
                  <span className="text-xs text-warm-400">{deal.store.name}</span>
                )}
                {deal.isFeatured && (
                  <Star size={10} className="fill-warning-400 text-warning-400" />
                )}
                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-300 hover:text-warm-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
      size: 320,
    },
    {
      id: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
      accessorFn: (row) => row.price,
      cell: ({ row }) => {
        const { price, originalPrice, discountPercent } = row.original;
        if (!price) return <span className="text-warm-300">—</span>;
        return (
          <div className="text-right">
            <p className="text-sm font-semibold text-warm-800">{formatCLP(price)}</p>
            {originalPrice && originalPrice > price && (
              <p className="text-xs text-warm-400 line-through">{formatCLP(originalPrice)}</p>
            )}
            {discountPercent && (
              <span className="text-xs font-medium text-success-700">-{discountPercent}%</span>
            )}
          </div>
        );
      },
      enableSorting: true,
      size: 110,
    },
    {
      id: 'temperature',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Temp." />,
      accessorFn: (row) => row.temperature,
      cell: ({ row }) => <TempBadge temperature={row.original.temperature} />,
      enableSorting: true,
      size: 90,
    },
    {
      id: 'status',
      header: 'Estado',
      accessorFn: (row) => row.status,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <DealStatusBadge status={row.original.status} />
          {row.original.deletedAt && (
            <span className="text-xs text-danger-500 font-medium">Eliminada</span>
          )}
        </div>
      ),
      size: 110,
    },
    {
      id: 'author',
      header: 'Autor',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserAvatar
            displayName={row.original.author.displayName}
            avatarUrl={row.original.author.avatarUrl}
            size="sm"
          />
          <span className="text-xs text-warm-600">{row.original.author.username}</span>
        </div>
      ),
      size: 140,
    },
    {
      id: 'clicks',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Clicks" />,
      accessorFn: (row) => row.clickCount,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-warm-600">
          {row.original.clickCount.toLocaleString('es-CL')}
        </span>
      ),
      enableSorting: true,
      size: 80,
    },
    {
      id: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Publicada" />,
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <span className="text-xs text-warm-400">
          {formatDate(row.original.createdAt)}
        </span>
      ),
      enableSorting: true,
      size: 130,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <DealActions deal={row.original} actions={actions} />,
      enableSorting: false,
      size: 48,
    },
  ], [actions]);

  const selectedIds = Object.keys(selectedRows)
    .filter((k) => selectedRows[k])
    .map((k) => data[Number(k)]?.id)
    .filter(Boolean) as number[];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      selectable
      selectedRows={selectedRows}
      onRowSelectionChange={onRowSelectionChange}
      deletedRowKey="deletedAt"
      serverPagination={{ total, pageIndex: page, pageSize, onPageChange, onPageSizeChange }}
      bulkActions={
        <BulkDealActions
          selectedIds={selectedIds}
          actions={actions}
          onClearSelection={() => onRowSelectionChange({})}
        />
      }
      emptyTitle="No hay ofertas"
      emptyDescription="Prueba ajustando los filtros o buscando otro término."
    />
  );
}
