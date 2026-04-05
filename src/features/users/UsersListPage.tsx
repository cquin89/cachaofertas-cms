import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { RowSelectionState, ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { timeAgo } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import type { User, UserRole, UserStatus, UserListParams } from '@/types/user';
import type { ApiResponse, PageResponse } from '@/types/api';
import { PAGINATION_DEFAULTS } from '@/config/constants';

const STATUS_CONFIG: Record<UserStatus, { label: string; variant: 'success' | 'default' | 'warning' | 'danger' }> = {
  active:     { label: 'Activo',      variant: 'success' },
  banned:     { label: 'Baneado',     variant: 'danger'  },
  unverified: { label: 'Sin verificar', variant: 'warning' },
  deleted:    { label: 'Eliminado',   variant: 'default' },
};

const ROLE_LABELS: Record<UserRole, string> = {
  content_editor:    'Editor',
  affiliate_manager: 'Afiliación',
  moderator:         'Moderador',
  admin:             'Admin',
  super_admin:       'Super Admin',
};

export default function UsersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const filters: UserListParams = {
    search:         searchParams.get('search') ?? undefined,
    role:           (searchParams.get('role')   ?? '') as UserRole | '',
    status:         (searchParams.get('status') ?? '') as UserStatus | '',
    includeDeleted: searchParams.get('includeDeleted') === 'true',
    page:           Number(searchParams.get('page') ?? '0'),
    limit:          Number(searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.PAGE_SIZE)),
  };

  const setFilter = useCallback(
    (updates: Partial<UserListParams>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === undefined || v === '' || v === false) next.delete(k);
          else next.set(k, String(v));
        });
        if (!('page' in updates)) next.delete('page');
        return next;
      });
      setSelectedRows({});
    },
    [setSearchParams]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== false) params.set(k, String(v));
      });
      const res = await api.get<ApiResponse<PageResponse<User>>>(`/admin/users?${params}`);
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const columns: ColumnDef<User>[] = [
    {
      id: 'user',
      header: 'Usuario',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={row.original.avatarUrl}
            displayName={row.original.displayName}
            size="sm"
          />
          <div className="min-w-0">
            <Link
              to={ROUTES.USER_DETAIL(row.original.id)}
              className="block font-medium text-sm text-warm-800 hover:text-primary-600 hover:underline truncate"
            >
              {row.original.displayName}
            </Link>
            <p className="text-xs text-warm-400 truncate">@{row.original.username} · {row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      size: 120,
      cell: ({ getValue }) => (
        <Badge variant="info">{ROLE_LABELS[getValue() as UserRole] ?? getValue() as string}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 110,
      cell: ({ getValue }) => {
        const s = getValue() as UserStatus;
        const cfg = STATUS_CONFIG[s] ?? { label: s, variant: 'default' as const };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: 'reputation',
      header: 'Reputación',
      size: 100,
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-warm-700">{(getValue() as number).toLocaleString('es-CL')}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Registrado',
      size: 130,
      cell: ({ getValue }) => (
        <span className="text-xs text-warm-400">{timeAgo(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: 'lastSeenAt',
      header: 'Último acceso',
      size: 130,
      cell: ({ getValue }) => (
        <span className="text-xs text-warm-400">
          {getValue() ? timeAgo(getValue() as string) : 'Nunca'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios"
        description="Gestiona los miembros de la comunidad."
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search ?? ''}
          onChange={(v) => setFilter({ search: v })}
          placeholder="Buscar por nombre, email o username…"
          className="max-w-sm"
        />
        <Select
          value={filters.role ?? ''}
          onValueChange={(v) => setFilter({ role: v as UserRole | '' })}
          className="w-36"
        >
          <option value="">Todos los roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select
          value={filters.status ?? ''}
          onValueChange={(v) => setFilter({ status: v as UserStatus | '' })}
          className="w-36"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-warm-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.includeDeleted ?? false}
            onChange={(e) => setFilter({ includeDeleted: e.target.checked })}
            className="h-4 w-4 accent-primary-500"
          />
          Incluir eliminados
        </label>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        deletedRowKey="deletedAt"
        selectable
        selectedRows={selectedRows}
        onRowSelectionChange={setSelectedRows}
        serverPagination={data ? {
          total: data.total,
          pageIndex: filters.page ?? 0,
          pageSize: filters.limit ?? PAGINATION_DEFAULTS.PAGE_SIZE,
          onPageChange: (page) => setFilter({ page }),
          onPageSizeChange: (limit) => setFilter({ limit }),
        } : undefined}
        emptyTitle="Sin usuarios"
        emptyDescription="No se encontraron usuarios con los filtros actuales."
      />
    </div>
  );
}
