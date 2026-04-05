import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Shield, Ban, RotateCcw, Tag, MessageSquare, Star, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { StatsCard } from '@/components/shared/StatsCard';
import { Can } from '@/components/shared/Can';
import { formatDate, timeAgo } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import { handleMutationError } from '@/lib/errorMapper';
import type { UserProfile, UserActivityItem, UserRole } from '@/types/user';
import type { ApiResponse, PageResponse } from '@/types/api';

const ROLE_LABELS: Record<UserRole, string> = {
  content_editor: 'Editor de contenido',
  affiliate_manager: 'Gestor de afiliación',
  moderator: 'Moderador',
  admin: 'Administrador',
  super_admin: 'Super Admin',
};

const banSchema = z.object({
  reason: z.string().min(5, 'Describe el motivo del baneo'),
  expiresAt: z.string().optional(),
});
type BanFormData = z.infer<typeof banSchema>;

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showBanForm, setShowBanForm] = useState(false);
  const [newRole, setNewRole] = useState<UserRole | ''>('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UserProfile>>(`/admin/users/${id}`);
      return res.data.data;
    },
  });

  const { data: activity } = useQuery({
    queryKey: ['user-activity', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<UserActivityItem>>>(`/admin/users/${id}/activity?limit=20&page=0`);
      return res.data.data.data;
    },
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BanFormData>({
    resolver: zodResolver(banSchema),
  });

  const banMutation = useMutation({
    mutationFn: (data: BanFormData) =>
      api.post(`/admin/users/${id}/ban`, { reason: data.reason, expiresAt: data.expiresAt || undefined }),
    onSuccess: () => {
      toast.success('Usuario baneado');
      qc.invalidateQueries({ queryKey: ['user', id] });
      setShowBanForm(false);
      reset();
    },
    onError: (err) => handleMutationError(err),
  });

  const unbanMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${id}/unban`),
    onSuccess: () => {
      toast.success('Baneo levantado');
      qc.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: (role: UserRole) => api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('Rol actualizado');
      qc.invalidateQueries({ queryKey: ['user', id] });
      setNewRole('');
    },
    onError: (err) => handleMutationError(err),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16" rounded="full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" rounded="lg" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={user.displayName}
        description={`@${user.username} · ${user.email}`}
        actions={
          <Button variant="secondary" onClick={() => navigate(ROUTES.USERS)}>
            ← Volver
          </Button>
        }
      />

      {/* User header card */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
        <UserAvatar avatarUrl={user.avatarUrl} displayName={user.displayName} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-bold text-warm-900">{user.displayName}</h2>
            <Badge variant="info">{ROLE_LABELS[user.role]}</Badge>
            {user.isBanned && <Badge variant="danger">Baneado</Badge>}
            {!user.isEmailVerified && <Badge variant="warning">Sin verificar</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-warm-500">
            Registrado {timeAgo(user.createdAt)}
            {user.lastSeenAt && ` · Último acceso ${timeAgo(user.lastSeenAt)}`}
          </p>
          {user.isBanned && user.banReason && (
            <p className="mt-1 text-xs text-danger-600">
              <span className="font-medium">Razón del baneo:</span> {user.banReason}
              {user.banExpiresAt && ` (hasta ${formatDate(user.banExpiresAt)})`}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Can perform="users:ban">
            {user.isBanned ? (
              <Button variant="secondary" size="sm" onClick={() => unbanMutation.mutate()} loading={unbanMutation.isPending}>
                <RotateCcw size={14} />
                Levantar baneo
              </Button>
            ) : (
              <Button variant="destructive" size="sm" onClick={() => setShowBanForm(!showBanForm)}>
                <Ban size={14} />
                Banear
              </Button>
            )}
          </Can>
          <Can perform="users:change_role">
            <div className="flex items-center gap-2">
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as UserRole)}
                className="w-36 text-xs"
              >
                <option value="">Cambiar rol…</option>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </Select>
              {newRole && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => changeRoleMutation.mutate(newRole as UserRole)}
                  loading={changeRoleMutation.isPending}
                >
                  <Shield size={12} />
                  Aplicar
                </Button>
              )}
            </div>
          </Can>
        </div>
      </div>

      {/* Ban form */}
      {showBanForm && (
        <form
          onSubmit={handleSubmit((d) => banMutation.mutate(d))}
          className="rounded-lg border border-danger-200 bg-danger-50/40 p-4 space-y-3"
        >
          <h3 className="font-display text-sm font-semibold text-danger-800">Banear usuario</h3>
          <div>
            <Textarea
              {...register('reason')}
              placeholder="Razón del baneo *"
              rows={2}
              className="resize-none"
            />
            {errors.reason && <p className="mt-0.5 text-xs text-danger-500">{errors.reason.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs text-warm-500">Vence (opcional — vacío = permanente)</label>
            <Input {...register('expiresAt')} type="datetime-local" className="max-w-xs" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setShowBanForm(false)}>Cancelar</Button>
            <Button variant="destructive" size="sm" type="submit" loading={banMutation.isPending}>Confirmar baneo</Button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Ofertas publicadas" value={user.stats.totalDeals} icon={Tag} />
        <StatsCard title="Comentarios" value={user.stats.totalComments} icon={MessageSquare} />
        <StatsCard title="Reputación" value={user.reputation} icon={Star} />
        <StatsCard title="Temperatura media" value={user.stats.avgTemperature} icon={Clock} valueSuffix="°" />
      </div>

      {/* Activity */}
      <div className="rounded-lg border border-warm-200 bg-white shadow-sm">
        <div className="border-b border-warm-100 px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-warm-800">Actividad reciente</h3>
        </div>
        <div className="divide-y divide-warm-100">
          {!activity || activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-warm-400">Sin actividad registrada</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warm-100 mt-0.5">
                  <Clock size={12} className="text-warm-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-warm-700">{item.description}</p>
                  {item.performedBy && (
                    <p className="text-xs text-warm-400">por @{item.performedBy}</p>
                  )}
                </div>
                <span className="text-xs text-warm-400 shrink-0">{timeAgo(item.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
