import { PanelLeftClose, PanelLeftOpen, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { useSidebarStore } from '@/stores/sidebarStore';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <>
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-sidebar',
          'transition-all duration-300',
          // Desktop: always visible, width por estado collapsed
          'lg:relative lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          // Mobile: slide in/out
          mobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px] lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-warm-800 px-3',
            collapsed ? 'justify-center' : 'gap-3'
          )}
        >
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-2 rounded-md p-1 transition-opacity hover:opacity-80"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500">
              <Flame size={18} className="text-white" />
            </span>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="block font-display text-sm font-bold leading-tight text-white">
                  CachaOfertas
                </span>
                <span className="block text-xs font-medium text-primary-400 leading-tight">
                  CMS
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navegación (scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <SidebarNav collapsed={collapsed} />
        </div>

        {/* Toggle collapse — solo desktop */}
        <div className="hidden border-t border-warm-800 p-3 lg:flex">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-500',
              'w-full transition-colors hover:bg-warm-800 hover:text-warm-200',
              collapsed && 'justify-center px-0'
            )}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span className="text-xs">Colapsar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
