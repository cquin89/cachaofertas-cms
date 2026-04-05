import type { Table } from '@tanstack/react-table';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SimpleSelect } from '@/components/ui/Select';
import { PAGINATION_DEFAULTS } from '@/config/constants';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRows?: number;
}

export function DataTablePagination<TData>({ table, totalRows }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = totalRows ?? table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-warm-200 px-4 py-3 sm:flex-row sm:items-center">
      {/* Selección */}
      <p className="text-xs text-warm-400">
        {selectedCount > 0
          ? `${selectedCount} fila${selectedCount > 1 ? 's' : ''} seleccionada${selectedCount > 1 ? 's' : ''}`
          : `${from}–${to} de ${total} registros`}
      </p>

      <div className="flex items-center gap-4">
        {/* Filas por página */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-warm-500">Filas por página</span>
          <SimpleSelect
            value={String(pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
            options={PAGINATION_DEFAULTS.PAGE_SIZE_OPTIONS.map((n) => ({
              value: String(n),
              label: String(n),
            }))}
            className="h-7 w-16 text-xs"
          />
        </div>

        {/* Navegación */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Primera página"
          >
            <ChevronsLeft size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="min-w-[60px] text-center text-xs text-warm-500">
            {pageIndex + 1} / {pageCount || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Página siguiente"
          >
            <ChevronRight size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Última página"
          >
            <ChevronsRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
