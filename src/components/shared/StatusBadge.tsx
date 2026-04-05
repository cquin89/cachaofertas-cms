import { Badge } from '@/components/ui/Badge';
import type { DealStatus } from '@/types/deal';
import type { CouponStatus } from '@/types/coupon';

const DEAL_STATUS_CONFIG: Record<DealStatus, { label: string; variant: 'success' | 'default' | 'warning' | 'danger' | 'info' }> = {
  active:   { label: 'Activa',     variant: 'success'  },
  expired:  { label: 'Expirada',   variant: 'default'  },
  sold_out: { label: 'Agotada',    variant: 'warning'  },
  rejected: { label: 'Rechazada',  variant: 'danger'   },
  pending:  { label: 'Pendiente',  variant: 'info'     },
  deleted:  { label: 'Eliminada',  variant: 'danger'   },
};

const COUPON_STATUS_CONFIG: Record<CouponStatus, { label: string; variant: 'success' | 'default' | 'warning' | 'danger' | 'info' }> = {
  active:     { label: 'Activo',      variant: 'success' },
  expired:    { label: 'Expirado',    variant: 'default' },
  unverified: { label: 'Sin verificar', variant: 'info'  },
  rejected:   { label: 'Rechazado',   variant: 'danger'  },
};

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const config = DEAL_STATUS_CONFIG[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function CouponStatusBadge({ status }: { status: CouponStatus }) {
  const config = COUPON_STATUS_CONFIG[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
