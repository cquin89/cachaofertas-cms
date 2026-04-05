import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Flag, Settings, ShieldBan, BookX, ScrollText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { Can } from '@/components/shared/Can';
import { timeAgo, formatDate } from '@/lib/utils';
import api from '@/lib/axios';
import type { FeatureFlag, SystemConfigEntry, BannedWord, IpBan, AuditLogEntry } from '@/types/analytics';
import type { ApiResponse, PageResponse } from '@/types/api';

const TABS = [
  { id: 'flags',  label: 'Feature Flags',   icon: Flag        },
  { id: 'config', label: 'Configuración',    icon: Settings    },
  { id: 'words',  label: 'Palabras Baneadas', icon: BookX      },
  { id: 'ips',    label: 'IPs Baneadas',      icon: ShieldBan  },
  { id: 'audit',  label: 'Audit Log',         icon: ScrollText },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('flags');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configuración del sistema"
        description="Feature flags, configuración global, seguridad y auditoría."
      />

      <div className="border-b border-warm-200">
        <nav className="-mb-px flex flex-wrap gap-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-warm-500 hover:border-warm-300 hover:text-warm-700'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'flags'  && <FeatureFlagsTab />}
      {activeTab === 'config' && <SystemConfigTab />}
      {activeTab === 'words'  && <BannedWordsTab />}
      {activeTab === 'ips'    && <IpBansTab />}
      {activeTab === 'audit'  && <AuditLogTab />}
    </div>
  );
}

/* ── Feature Flags ── */
function FeatureFlagsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FeatureFlag[]>>('/admin/settings/flags');
      return res.data.data;
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, isEnabled }: { id: number; isEnabled: boolean }) =>
      api.patch(`/admin/settings/flags/${id}`, { isEnabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feature-flags'] }),
    onError: () => toast.error('Error al actualizar el flag'),
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-2">
      {data?.map((flag) => (
        <div key={flag.id} className="flex items-center gap-4 rounded-lg border border-warm-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-warm-800">{flag.key}</span>
              <Badge variant={flag.isEnabled ? 'success' : 'default'}>{flag.isEnabled ? 'ON' : 'OFF'}</Badge>
            </div>
            <p className="text-xs text-warm-500 mt-0.5">{flag.description ?? flag.name}</p>
            {flag.updatedByUsername && (
              <p className="text-[10px] text-warm-400">Actualizado por @{flag.updatedByUsername} · {timeAgo(flag.updatedAt)}</p>
            )}
          </div>
          <Can perform="settings:manage">
            <Switch
              checked={flag.isEnabled}
              onCheckedChange={(v) => toggle.mutate({ id: flag.id, isEnabled: v })}
            />
          </Can>
        </div>
      ))}
    </div>
  );
}

/* ── System Config ── */
function SystemConfigTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SystemConfigEntry[]>>('/admin/settings/config');
      return res.data.data;
    },
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const update = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.put(`/admin/settings/config/${key}`, { value }),
    onSuccess: () => {
      toast.success('Configuración actualizada');
      qc.invalidateQueries({ queryKey: ['system-config'] });
      setEditingKey(null);
    },
    onError: () => toast.error('Error al actualizar'),
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-2">
      {data?.map((entry) => (
        <div key={entry.key} className="rounded-lg border border-warm-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-warm-800">{entry.key}</span>
                <Badge variant="info">{entry.type}</Badge>
              </div>
              {entry.description && <p className="text-xs text-warm-500">{entry.description}</p>}
              {editingKey === entry.key ? (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="max-w-xs font-mono text-xs"
                  />
                  <Button size="sm" onClick={() => update.mutate({ key: entry.key, value: editingValue })} loading={update.isPending}>
                    <Save size={12} />
                    Guardar
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditingKey(null)}>Cancelar</Button>
                </div>
              ) : (
                <p className="mt-1 font-mono text-xs text-warm-600 bg-warm-50 rounded px-2 py-1 inline-block">{entry.value}</p>
              )}
            </div>
            <Can perform="settings:manage">
              {editingKey !== entry.key && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditingKey(entry.key); setEditingValue(entry.value); }}
                >
                  Editar
                </Button>
              )}
            </Can>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Banned Words ── */
function BannedWordsTab() {
  const qc = useQueryClient();
  const [newWord, setNewWord] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const { data, isLoading } = useQuery({
    queryKey: ['banned-words'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BannedWord[]>>('/admin/settings/banned-words');
      return res.data.data;
    },
  });

  const add = useMutation({
    mutationFn: () => api.post('/admin/settings/banned-words', { word: newWord, severity }),
    onSuccess: () => {
      toast.success('Palabra añadida');
      qc.invalidateQueries({ queryKey: ['banned-words'] });
      setNewWord('');
    },
    onError: () => toast.error('Error al añadir'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/settings/banned-words/${id}`),
    onSuccess: () => {
      toast.success('Palabra eliminada');
      qc.invalidateQueries({ queryKey: ['banned-words'] });
    },
  });

  const SEVERITY_VARIANT: Record<string, 'warning' | 'danger' | 'info'> = {
    low: 'info', medium: 'warning', high: 'danger',
  };

  return (
    <div className="space-y-4">
      <Can perform="settings:manage">
        <div className="flex items-center gap-2">
          <Input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Nueva palabra a banear"
            className="max-w-xs"
            onKeyDown={(e) => e.key === 'Enter' && newWord && add.mutate()}
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as typeof severity)}
            className="h-9 rounded-sm border border-warm-300 px-2 text-sm text-warm-700"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
          <Button size="sm" disabled={!newWord} onClick={() => add.mutate()} loading={add.isPending}>
            <Plus size={14} />
            Añadir
          </Button>
        </div>
      </Can>

      {isLoading ? <LoadingSkeleton rows={3} /> : (
        <div className="flex flex-wrap gap-2">
          {data?.map((w) => (
            <div key={w.id} className="flex items-center gap-1 rounded-full border border-warm-200 bg-white pl-3 pr-1.5 py-1">
              <span className="text-sm font-mono text-warm-800">{w.word}</span>
              <Badge variant={SEVERITY_VARIANT[w.severity]}>{w.severity}</Badge>
              <Can perform="settings:manage">
                <button
                  type="button"
                  onClick={() => remove.mutate(w.id)}
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-warm-400 hover:bg-danger-50 hover:text-danger-600"
                >
                  <Trash2 size={11} />
                </button>
              </Can>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── IP Bans ── */
function IpBansTab() {
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm<{ ipAddress: string; reason: string; expiresAt: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['ip-bans'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<IpBan[]>>('/admin/settings/ip-bans');
      return res.data.data;
    },
  });

  const add = useMutation({
    mutationFn: (d: { ipAddress: string; reason: string; expiresAt?: string }) =>
      api.post('/admin/settings/ip-bans', d),
    onSuccess: () => {
      toast.success('IP baneada');
      qc.invalidateQueries({ queryKey: ['ip-bans'] });
      reset();
    },
    onError: () => toast.error('Error al banear IP'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/settings/ip-bans/${id}`),
    onSuccess: () => {
      toast.success('Ban eliminado');
      qc.invalidateQueries({ queryKey: ['ip-bans'] });
    },
  });

  return (
    <div className="space-y-4">
      <Can perform="settings:manage">
        <form
          onSubmit={handleSubmit((d) => add.mutate({ ...d, expiresAt: d.expiresAt || undefined }))}
          className="flex flex-wrap items-end gap-2"
        >
          <div>
            <label className="mb-1 block text-xs text-warm-500">Dirección IP</label>
            <Input {...register('ipAddress')} placeholder="192.168.1.1" className="w-40 font-mono" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-warm-500">Motivo</label>
            <Input {...register('reason')} placeholder="Spam / abuso" className="w-48" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-warm-500">Vence (opcional)</label>
            <Input {...register('expiresAt')} type="datetime-local" className="w-44" />
          </div>
          <Button type="submit" size="sm" loading={add.isPending}>
            <Plus size={14} />
            Banear
          </Button>
        </form>
      </Can>

      {isLoading ? <LoadingSkeleton rows={3} /> : (
        <div className="space-y-2">
          {data?.map((ban) => (
            <div key={ban.id} className="flex items-center gap-3 rounded-lg border border-warm-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="font-mono text-sm font-medium text-warm-800">{ban.ipAddress}</span>
              <span className="flex-1 text-xs text-warm-500">{ban.reason}</span>
              {ban.expiresAt && <span className="text-xs text-warm-400">Vence {formatDate(ban.expiresAt)}</span>}
              <Can perform="settings:manage">
                <button
                  type="button"
                  onClick={() => remove.mutate(ban.id)}
                  className="flex h-7 w-7 items-center justify-center rounded text-warm-400 hover:bg-danger-50 hover:text-danger-600"
                >
                  <Trash2 size={13} />
                </button>
              </Can>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Audit Log ── */
function AuditLogTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PageResponse<AuditLogEntry>>>('/admin/audit-log?limit=50&page=0');
      return res.data.data.data;
    },
  });

  if (isLoading) return <LoadingSkeleton rows={8} />;

  return (
    <div className="rounded-lg border border-warm-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-200 bg-warm-50">
              {['Usuario', 'Acción', 'Entidad', 'IP', 'Fecha'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-warm-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((entry) => (
              <tr key={entry.id} className="border-b border-warm-100 hover:bg-warm-50">
                <td className="px-4 py-2.5">
                  <span className="text-sm text-warm-700">@{entry.userUsername}</span>
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant="info">{entry.action}</Badge>
                </td>
                <td className="px-4 py-2.5 text-xs text-warm-500">
                  {entry.entityType}{entry.entityId ? ` #${entry.entityId}` : ''}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-warm-400">
                  {entry.ipAddress ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-xs text-warm-400">
                  {timeAgo(entry.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" rounded="lg" />
      ))}
    </div>
  );
}
