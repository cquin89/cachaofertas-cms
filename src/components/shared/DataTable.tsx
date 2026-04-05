import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type OnChangeFn,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { DataTablePagination } from './DataTablePagination';
import { EmptyState } from './EmptyState';
import { PAGINATION_DEFAULTS } from '@/config/constants';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  /** Pagination controlada externamente (server-side) */
  serverPagination?: {
    total: number;
    pageIndex: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  /** Selección de filas */
  selectable?: boolean;
  selectedRows?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Acciones sobre filas seleccionadas */
  bulkActions?: React.ReactNode;
  /** Estado vacío */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Filas que se muestran con estilo eliminado (soft-delete) */
  deletedRowKey?: keyof TData;
  className?: string;
}

export function DataTable<TData>({
  columns, data, loading,
  serverPagination, selectable,
  selectedRows, onRowSelectionChange,
  bulkActions, emptyTitle, emptyDescription,
  deletedRowKey, className,
}: DataTableProps<TData>) {
  const [sorting, setSorting]           = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [localRowSelection, setLocalRowSelection] = useState<RowSelectionState>({});

  const rowSelection = selectedRows ?? localRowSelection;
  const setRowSelection = onRowSelectionChange ?? setLocalRowSelection;

  /* Paginación local vs server */
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: serverPagination?.pageIndex ?? 0,
    pageSize: serverPagination?.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
  });

  const pagination = serverPagination
    ? { pageIndex: serverPagination.pageIndex, pageSize: serverPagination.pageSize }
    : localPagination;

  const pageCount = serverPagination
    ? Math.ceil(serverPagination.total / serverPagination.pageSize)
    : undefined;

  /* Columna de selección */
  const selectColumn: ColumnDef<TData, unknown> = {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Seleccionar fila"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };

  const finalColumns = selectable ? [selectColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount,
    state: { sorting, columnVisibility, rowSelection, pagination },
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: serverPagination
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(pagination) : updater;
          serverPagination.onPageChange(next.pageIndex);
          if (next.pageSize !== pagination.pageSize) {
            serverPagination.onPageSizeChange(next.pageSize);
          }
        }
      : setLocalPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: !!serverPagination,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  if (loading) return <SkeletonTable rows={8} cols={columns.length + (selectable ? 1 : 0)} />;

  return (
    <div className={cn('flex flex-col rounded-lg border border-warm-200 bg-white overflow-hidden shadow-sm', className)}>
      {/* Barra de acciones masivas */}
      {selectable && selectedCount > 0 && bulkActions && (
        <div className="flex items-center gap-3 border-b border-primary-200 bg-primary-50 px-4 py-2.5">
          <span className="text-sm font-medium text-primary-700">
            {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-warm-200 bg-warm-50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className="px-4 py-3 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={finalColumns.length} className="py-0">
                  <EmptyState
                    title={emptyTitle ?? 'Sin resultados'}
                    description={emptyDescription ?? 'No hay registros que coincidan con los filtros aplicados.'}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isDeleted = deletedRowKey
                  ? Boolean((row.original as Record<keyof TData, unknown>)[deletedRowKey])
                  : false;

                return (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    className={cn(
                      'border-b border-warm-100 transition-colors',
                      'hover:bg-primary-50/40',
                      'data-[state=selected]:bg-primary-50',
                      isDeleted && 'opacity-50 bg-danger-50/20 line-through-children'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <DataTablePagination
        table={table}
        totalRows={serverPagination?.total}
      />
    </div>
  );
}
