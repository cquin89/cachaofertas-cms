import { useQuery } from '@tanstack/react-query';
import { Filter, X } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { SimpleSelect } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/shared/Can';
import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { DealStatus } from '@/types/deal';
import type { Category } from '@/types/analytics';
import type { Store } from '@/types/affiliate';

interface DealFiltersProps {
  search: string;
  status: DealStatus | '';
  categoryId: number | undefined;
  storeId: number | undefined;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  includeDeleted: boolean;
  onSearch: (v: string) => void;
  onStatus: (v: DealStatus | '') => void;
  onCategory: (v: number | undefined) => void;
  onStore: (v: number | undefined) => void;
  onSort: (by: string, dir: 'asc' | 'desc') => void;
  onIncludeDeleted: (v: boolean) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'active',   label: 'Activa' },
  { value: 'pending',  label: 'Pendiente' },
  { value: 'expired',  label: 'Expirada' },
  { value: 'sold_out', label: 'Agotada' },
  { value: 'rejected', label: 'Rechazada' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc',   label: 'Más recientes' },
  { value: 'createdAt:asc',    label: 'Más antiguos' },
  { value: 'temperature:desc', label: 'Mayor temperatura' },
  { value: 'clickCount:desc',  label: 'Más clicks' },
  { value: 'price:asc',        label: 'Precio: menor a mayor' },
  { value: 'price:desc',       label: 'Precio: mayor a menor' },
];

export function DealFilters({
  search, status, categoryId, storeId, sortBy, sortDir,
  includeDeleted, onSearch, onStatus, onCategory, onStore,
  onSort, onIncludeDeleted, onReset, hasActiveFilters,
}: DealFiltersProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories-select'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
    staleTime: 5 * 60_000,
  });

  const { data: stores } = useQuery({
    queryKey: ['stores-select'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Store[]>>('/stores');
      return res.data.data;
    },
    staleTime: 5 * 60_000,
  });

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...(categories ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const storeOptions = [
    { value: '', label: 'Todas las tiendas' },
    ...(stores ?? []).map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const sortValue = `${sortBy}:${sortDir}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder="Buscar ofertas..."
        className="w-64"
      />

      {/* Status */}
      <SimpleSelect
        value={status}
        onValueChange={(v) => onStatus(v as DealStatus | '')}
        options={STATUS_OPTIONS}
        className="w-44"
      />

      {/* Categoría */}
      <SimpleSelect
        value={categoryId ? String(categoryId) : ''}
        onValueChange={(v) => onCategory(v ? Number(v) : undefined)}
        options={categoryOptions}
        className="w-48"
      />

      {/* Tienda */}
      <SimpleSelect
        value={storeId ? String(storeId) : ''}
        onValueChange={(v) => onStore(v ? Number(v) : undefined)}
        options={storeOptions}
        className="w-44"
      />

      {/* Ordenar */}
      <SimpleSelect
        value={sortValue}
        onValueChange={(v) => {
          const [by, dir] = v.split(':');
          onSort(by, dir as 'asc' | 'desc');
        }}
        options={SORT_OPTIONS}
        className="w-48"
      />

      {/* Mostrar eliminados — solo admin+ */}
      <Can perform="restore:deal">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-warm-600">
          <Switch
            checked={includeDeleted}
            onCheckedChange={onIncludeDeleted}
          />
          <span className="select-none">Mostrar eliminados</span>
        </label>
      </Can>

      {/* Reset */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X size={13} />
          Limpiar filtros
        </Button>
      )}

      {hasActiveFilters && (
        <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
          <Filter size={10} />
          Filtros activos
        </span>
      )}
    </div>
  );
}
