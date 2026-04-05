import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RowSelectionState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/PageHeader';
import { DealFilters } from './components/DealFilters';
import { DealsTable } from './components/DealsTable';
import { useDeals } from './hooks/useDeals';
import { useDealActions } from './hooks/useDealActions';
import type { DealListParams, DealStatus } from '@/types/deal';
import { PAGINATION_DEFAULTS } from '@/config/constants';

export default function DealsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  /* ── Leer filtros desde URL ── */
  const filters: DealListParams = {
    search:         searchParams.get('search')     ?? undefined,
    status:         (searchParams.get('status')    ?? '') as DealStatus | '',
    categoryId:     searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    storeId:        searchParams.get('storeId')    ? Number(searchParams.get('storeId'))    : undefined,
    sortBy:         (searchParams.get('sortBy')    ?? 'createdAt') as DealListParams['sortBy'],
    sortDir:        (searchParams.get('sortDir')   ?? 'desc') as 'asc' | 'desc',
    page:           Number(searchParams.get('page')  ?? '0'),
    limit:          Number(searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.PAGE_SIZE)),
    includeDeleted: searchParams.get('includeDeleted') === 'true',
  };

  /* ── Actualizar filtros en URL ── */
  const setFilter = useCallback(
    (updates: Partial<DealListParams>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === undefined || value === '' || value === false) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        if (!('page' in updates)) next.delete('page');
        return next;
      });
      setSelectedRows({});
    },
    [setSearchParams]
  );

  const hasActiveFilters = !!(
    filters.search || filters.status || filters.categoryId ||
    filters.storeId || filters.includeDeleted ||
    filters.sortBy !== 'createdAt' || filters.sortDir !== 'desc'
  );

  function resetFilters() {
    setSearchParams({});
    setSelectedRows({});
  }

  /* ── Data & actions ── */
  const { data, isLoading } = useDeals(filters);
  const actions = useDealActions(filters);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Ofertas"
        description={data ? `${data.total.toLocaleString('es-CL')} ofertas en total` : undefined}
      />

      <DealFilters
        search={filters.search ?? ''}
        status={filters.status ?? ''}
        categoryId={filters.categoryId}
        storeId={filters.storeId}
        sortBy={filters.sortBy ?? 'createdAt'}
        sortDir={filters.sortDir ?? 'desc'}
        includeDeleted={filters.includeDeleted ?? false}
        onSearch={(v) => setFilter({ search: v || undefined })}
        onStatus={(v) => setFilter({ status: v })}
        onCategory={(v) => setFilter({ categoryId: v })}
        onStore={(v) => setFilter({ storeId: v })}
        onSort={(by, dir) => setFilter({ sortBy: by as DealListParams['sortBy'], sortDir: dir })}
        onIncludeDeleted={(v) => setFilter({ includeDeleted: v })}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <DealsTable
        data={data?.data ?? []}
        total={data?.total ?? 0}
        loading={isLoading}
        page={filters.page ?? 0}
        pageSize={filters.limit ?? PAGINATION_DEFAULTS.PAGE_SIZE}
        onPageChange={(p) => setFilter({ page: p })}
        onPageSizeChange={(s) => setFilter({ limit: s })}
        selectedRows={selectedRows}
        onRowSelectionChange={setSelectedRows}
        actions={actions}
      />
    </div>
  );
}
