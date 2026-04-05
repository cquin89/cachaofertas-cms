import { Menu, Sun, Moon, Monitor, LogOut, User, ChevronDown, Search } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { useAuthStore } from '@/stores/authStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useThemeStore } from '@/stores/themeStore';
import { getInitials, cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  const initials = user ? getInitials(user.displayName) : '?';

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-warm-200 bg-surface-card px-4 dark:border-warm-700 dark:bg-surface-card">
      {/* Hamburger — solo mobile */}
      <button
        type="button"
        onClick={toggleMobile}
        className="flex items-center justify-center rounded-md p-1.5 text-warm-500 transition-colors hover:bg-warm-100 hover:text-warm-700 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumbs */}
      <div className="flex-1 overflow-hidden">
        <Breadcrumbs />
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-1">
        {/* Command palette trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden items-center gap-2 rounded-md border border-warm-200 bg-warm-50 px-2.5 py-1.5 text-xs text-warm-400 transition-colors hover:border-warm-300 hover:text-warm-600 sm:flex"
          title="Paleta de comandos (Ctrl+K)"
        >
          <Search size={13} />
          <span>Buscar…</span>
          <kbd className="ml-1 rounded border border-warm-200 bg-white px-1 font-mono text-[10px]">⌘K</kbd>
        </button>

        {/* Toggle de tema */}
        <ThemeToggle theme={theme} setTheme={setTheme} />

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-warm-100"
            >
              {/* Avatar */}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 font-display text-xs font-bold text-white">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </span>
              <span className="hidden max-w-[120px] truncate font-medium text-warm-700 sm:block">
                {user?.displayName}
              </span>
              <ChevronDown size={14} className="text-warm-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-dropdown min-w-[180px] overflow-hidden rounded-lg border border-warm-200 bg-surface-card p-1 shadow-lg animate-slide-down"
            >
              {/* Info del usuario */}
              <div className="px-3 py-2 border-b border-warm-100 mb-1">
                <p className="font-medium text-sm text-warm-900 truncate">{user?.displayName}</p>
                <p className="text-xs text-warm-400 truncate">{user?.email}</p>
                <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              <DropdownMenu.Item
                onSelect={() => navigate(ROUTES.USERS + '/' + user?.id)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 outline-none hover:bg-warm-100 hover:text-warm-900"
              >
                <User size={14} />
                Mi perfil
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-warm-100" />

              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-danger-600 outline-none hover:bg-danger-50"
              >
                <LogOut size={14} />
                Cerrar sesión
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}

/* ── Theme toggle ── */
type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  const icons: Record<Theme, typeof Sun> = {
    light:  Sun,
    dark:   Moon,
    system: Monitor,
  };
  const Icon = icons[theme];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-warm-500 transition-colors hover:bg-warm-100 hover:text-warm-700"
          aria-label="Cambiar tema"
        >
          <Icon size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-dropdown min-w-[140px] overflow-hidden rounded-lg border border-warm-200 bg-surface-card p-1 shadow-lg animate-slide-down"
        >
          {(['light', 'dark', 'system'] as Theme[]).map((t) => {
            const TIcon = icons[t];
            const labels: Record<Theme, string> = { light: 'Claro', dark: 'Oscuro', system: 'Sistema' };
            return (
              <DropdownMenu.Item
                key={t}
                onSelect={() => setTheme(t)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none',
                  theme === t
                    ? 'bg-primary-50 font-medium text-primary-700'
                    : 'text-warm-700 hover:bg-warm-100'
                )}
              >
                <TIcon size={14} />
                {labels[t]}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
