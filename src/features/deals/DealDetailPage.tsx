import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink, Store, Tag, Calendar, MousePointerClick,
  MessageSquare, ThumbsUp, Star,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageHeader } from '@/components/layout/PageHeader';
import { DealStatusBadge } from '@/components/shared/StatusBadge';
import { TempBadge } from '@/components/shared/TempBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { DealEditHistory } from './components/DealEditHistory';
import { DealActions } from './components/DealActions';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useDeal, useDealPriceHistory, useDealEditHistory } from './hooks/useDeals';
import { useDealActions } from './hooks/useDealActions';
import { formatCLP, formatDate, timeAgo } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = Number(id ?? 0);

  const { data: deal, isLoading }          = useDeal(dealId);
  const { data: priceHistory }             = useDealPriceHistory(dealId);
  const { data: editHistory, isLoading: histLoading } = useDealEditHistory(dealId);
  const actions = useDealActions();

  if (isLoading) return <DetailSkeleton />;
  if (!deal) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-lg font-semibold text-warm-700">Oferta no encontrada</p>
      <Link to={ROUTES.DEALS} className="text-sm text-primary-500 hover:underline">
        Volver a ofertas
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title={deal.title}
        description={`ID: ${deal.id} · Creada ${timeAgo(deal.createdAt)}`}
        actions={<DealActions deal={deal} actions={actions} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Columna principal (2/3) ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Info card */}
          <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              {deal.imageUrl && (
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="h-32 w-32 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DealStatusBadge status={deal.status} />
                  <TempBadge temperature={deal.temperature} />
                  {deal.isFeatured && (
                    <Badge variant="warning">
                      <Star size={10} className="fill-current" /> Destacada
                    </Badge>
                  )}
                  {deal.deletedAt && (
                    <Badge variant="danger">Eliminada</Badge>
                  )}
                </div>

                {deal.description && (
                  <p className="mt-3 text-sm text-warm-600 line-clamp-3">{deal.description}</p>
                )}

                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary-500 hover:underline"
                >
                  Ver oferta <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Meta grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-warm-100 pt-4 sm:grid-cols-4">
              <MetaItem icon={Tag} label="Precio">
                {deal.price ? formatCLP(deal.price) : '—'}
                {deal.originalPrice && deal.originalPrice > (deal.price ?? 0) && (
                  <span className="ml-1 text-xs text-warm-400 line-through">
                    {formatCLP(deal.originalPrice)}
                  </span>
                )}
              </MetaItem>
              <MetaItem icon={MousePointerClick} label="Clicks">
                {deal.clickCount.toLocaleString('es-CL')}
              </MetaItem>
              <MetaItem icon={ThumbsUp} label="Votos">
                {deal.voteCount.toLocaleString('es-CL')}
              </MetaItem>
              <MetaItem icon={MessageSquare} label="Comentarios">
                {deal.commentCount.toLocaleString('es-CL')}
              </MetaItem>
              {deal.store && (
                <MetaItem icon={Store} label="Tienda">
                  {deal.store.name}
                </MetaItem>
              )}
              {deal.category && (
                <MetaItem icon={Tag} label="Categoría">
                  {deal.category.name}
                </MetaItem>
              )}
              <MetaItem icon={Calendar} label="Publicada">
                {formatDate(deal.createdAt)}
              </MetaItem>
              {deal.expiresAt && (
                <MetaItem icon={Calendar} label="Expira">
                  {formatDate(deal.expiresAt)}
                </MetaItem>
              )}
            </div>
          </div>

          {/* Historial de precios */}
          {priceHistory && priceHistory.length > 0 && (
            <div className="rounded-lg border border-warm-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-display text-sm font-semibold text-warm-800">
                Historial de precios
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={priceHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis
                    dataKey="recordedAt"
                    tickLine={false} axisLine={false}
                    tick={{ fontSize: 10, fill: '#A8A29E' }}
                    tickFormatter={(v: string) => {
                      try { return format(parseISO(v), 'd MMM', { locale: es }); }
                      catch { return v; }
                    }}
                  />
                  <YAxis
                    tickLine={false} axisLine={false}
                    tick={{ fontSize: 10, fill: '#A8A29E' }}
                    tickFormatter={(v: number) => formatCLP(v)}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCLP(v), 'Precio']}
                    labelFormatter={(l: string) => {
                      try { return format(parseISO(l), "d 'de' MMM yyyy", { locale: es }); }
                      catch { return l; }
                    }}
                  />
                  <Area
                    type="monotone" dataKey="price"
                    stroke="#F97316" strokeWidth={2}
                    fill="url(#priceGradient)" dot={false}
                    activeDot={{ r: 4, fill: '#F97316' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Historial de ediciones */}
          <DealEditHistory items={editHistory} loading={histLoading} />
        </div>

        {/* ── Panel lateral (1/3) ── */}
        <div className="flex flex-col gap-4">
          {/* Autor */}
          <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-warm-400">
              Publicado por
            </p>
            <div className="flex items-center gap-3">
              <UserAvatar
                displayName={deal.author.displayName}
                avatarUrl={deal.author.avatarUrl}
                size="lg"
              />
              <div>
                <p className="font-medium text-warm-800">{deal.author.displayName}</p>
                <p className="text-xs text-warm-400">@{deal.author.username}</p>
                <p className="text-xs text-warm-400">{deal.author.reputation} rep.</p>
              </div>
            </div>
            <Link
              to={ROUTES.USER_DETAIL(deal.author.id)}
              className="mt-3 block text-xs text-primary-500 hover:underline"
            >
              Ver perfil →
            </Link>
          </div>

          {/* Coupon code */}
          {deal.couponCode && (
            <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm-400">
                Código de cupón
              </p>
              <code className="block rounded-md bg-warm-100 px-3 py-2 font-mono text-sm font-bold tracking-widest text-warm-800">
                {deal.couponCode}
              </code>
            </div>
          )}

          {/* IDs y slugs técnicos */}
          <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm-400">
              Datos técnicos
            </p>
            <dl className="space-y-1.5 font-mono text-xs text-warm-600">
              <div className="flex justify-between">
                <dt className="text-warm-400">ID</dt>
                <dd>{deal.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-warm-400">Slug</dt>
                <dd className="truncate">{deal.slug}</dd>
              </div>
              {deal.updatedAt && (
                <div className="flex justify-between">
                  <dt className="text-warm-400">Actualizada</dt>
                  <dd>{timeAgo(deal.updatedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function MetaItem({
  icon: Icon, label, children,
}: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="flex items-center gap-1 text-xs text-warm-400">
        <Icon size={11} />
        {label}
      </dt>
      <dd className="text-sm font-medium text-warm-800">{children}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-80" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-48 w-full" rounded="lg" />
          <Skeleton className="h-40 w-full" rounded="lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" rounded="lg" />
          <Skeleton className="h-24 w-full" rounded="lg" />
        </div>
      </div>
    </div>
  );
}
