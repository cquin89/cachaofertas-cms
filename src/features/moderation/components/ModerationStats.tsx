import { Scale, Tag, MessageSquare, Users } from 'lucide-react';

interface ModerationStatsProps {
  counts: { deal: number; comment: number; user: number; total: number };
}

export function ModerationStats({ counts }: ModerationStatsProps) {
  const stats = [
    { label: 'Total pendientes', value: counts.total, icon: Scale,        highlight: counts.total > 0 },
    { label: 'Ofertas',          value: counts.deal,  icon: Tag,           highlight: false },
    { label: 'Comentarios',      value: counts.comment, icon: MessageSquare, highlight: false },
    { label: 'Usuarios',         value: counts.user,  icon: Users,         highlight: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex items-center gap-3 rounded-lg border p-4 shadow-sm ${
            s.highlight && s.value > 0
              ? 'border-primary-200 bg-primary-50'
              : 'border-warm-200 bg-white'
          }`}
        >
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            s.highlight && s.value > 0 ? 'bg-primary-100' : 'bg-warm-100'
          }`}>
            <s.icon size={18} className={s.highlight && s.value > 0 ? 'text-primary-600' : 'text-warm-500'} />
          </span>
          <div>
            <p className={`font-display text-xl font-bold ${
              s.highlight && s.value > 0 ? 'text-primary-700' : 'text-warm-900'
            }`}>
              {s.value}
            </p>
            <p className="text-xs text-warm-400">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
