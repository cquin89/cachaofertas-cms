import { NavLink } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  LayoutDashboard, Tag, Ticket, Scale, FileText, Image, HelpCircle,
  Megaphone, CalendarDays, Store, FolderOpen, DollarSign,
  BarChart2, Users, Settings,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';
import api from '@/lib/axios';
import type { ApiResponse, DashboardStats } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: string;
  badgeKey?: 'moderation';
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    ],
  },
  {
    items: [
      { label: 'Ofertas',     path: ROUTES.DEALS,      icon: Tag,    permission: 'view:deals' },
      { label: 'Cupones',     path: ROUTES.COUPONS,    icon: Ticket },
      { label: 'Moderación',  path: ROUTES.MODERATION, icon: Scale,  permission: 'view:moderation_queue', badgeKey: 'moderation' },
    ],
  },
  {
    label: 'CONTENIDO',
    items: [
      { label: 'Páginas',   path: ROUTES.PAGES,         icon: FileText },
      { label: 'Banners',   path: ROUTES.BANNERS,       icon: Image },
      { label: 'FAQs',      path: ROUTES.FAQS,          icon: HelpCircle },
      { label: 'Anuncios',  path: ROUTES.ANNOUNCEMENTS, icon: Megaphone },
      { label: 'Eventos',   path: ROUTES.EVENTS,        icon: CalendarDays },
    ],
  },
  {
    label: 'CATÁLOGO',
    items: [
      { label: 'Tiendas',     path: ROUTES.STORES,     icon: Store,       permission: 'create:store' },
      { label: 'Categorías',  path: ROUTES.CATEGORIES, icon: FolderOpen,  permission: 'delete:category' },
    ],
  },
  {
    label: 'NEGOCIO',
    items: [
      { label: 'Afiliación', path: ROUTES.AFFILIATE,  icon: DollarSign, permission: 'view:affiliate_report' },
      { label: 'Analytics',  path: ROUTES.ANALYTICS,  icon: BarChart2,  permission: 'view:analytics' },
      { label: 'Usuarios',   path: ROUTES.USERS,      icon: Users,      permission: 'view:users' },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { label: 'Configuración', path: ROUTES.SETTINGS, icon: Settings, permission: 'edit:feature_flag' },
    ],
  },
];

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const { can } = usePermission();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: dashStats } = useQuery({
    queryKey: ['dashboard-stats-nav'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
      return res.data.data;
    },
    staleTime: 60_000,
    enabled: isAuthenticated,
  });

  const badges: Record<string, number> = {
    moderation: dashStats?.pendingModerationCount ?? 0,
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <nav className="flex flex-col gap-4 px-3 py-2">
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter(
            (item) => !item.permission || can(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi}>
              {group.label && !collapsed && (
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-warm-600">
                  {group.label}
                </p>
              )}
              {group.label && collapsed && (
                <div className="mb-1 h-px bg-warm-700/50" />
              )}

              <ul className="flex flex-col gap-0.5">
                {visibleItems.map((item) => {
                  const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                  return (
                    <li key={item.path}>
                      <NavItem item={item} collapsed={collapsed} badge={badge} />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </Tooltip.Provider>
  );
}

/* ── NavItem individual ── */
interface NavItemProps {
  item: NavItem;
  collapsed: boolean;
  badge: number;
}

function NavItem({ item, collapsed, badge }: NavItemProps) {
  const Icon = item.icon;

  const linkContent = (isActive: boolean) => (
    <span
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
        isActive
          ? 'border-l-2 border-primary-500 bg-primary-500/10 text-primary-400'
          : 'border-l-2 border-transparent text-warm-400 hover:bg-warm-800/50 hover:text-warm-200',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {badge > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-bold text-white animate-pulse-orange">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </span>
  );

  const navLink = (
    <NavLink to={item.path} end={item.path === ROUTES.DASHBOARD}>
      {({ isActive }) => linkContent(isActive)}
    </NavLink>
  );

  if (!collapsed) return navLink;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{navLink}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="z-tooltip flex items-center gap-2 rounded-md bg-surface-tooltip px-3 py-1.5 text-sm font-medium text-warm-100 shadow-lg"
        >
          {item.label}
          {badge > 0 && (
            <span className="rounded-full bg-primary-500 px-1.5 py-0.5 text-xs font-bold text-white">
              {badge}
            </span>
          )}
          <Tooltip.Arrow className="fill-surface-tooltip" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
