import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  LayoutDashboard, Tag, ShieldAlert, FileText, Image, HelpCircle,
  Megaphone, Calendar, Store, FolderTree, Ticket, Users, BarChart2,
  Settings, LogOut, Sun, Moon, Monitor,
} from 'lucide-react';
import {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
} from '@/components/ui/Command';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { ROUTES } from '@/config/routes';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { group: 'Navegación', label: 'Dashboard',      icon: LayoutDashboard, route: ROUTES.DASHBOARD,    shortcut: 'G D' },
  { group: 'Navegación', label: 'Ofertas',          icon: Tag,             route: ROUTES.DEALS,        shortcut: 'G O' },
  { group: 'Navegación', label: 'Moderación',       icon: ShieldAlert,     route: ROUTES.MODERATION,   shortcut: 'G M' },
  { group: 'Navegación', label: 'Páginas',          icon: FileText,        route: ROUTES.PAGES          },
  { group: 'Navegación', label: 'Banners',          icon: Image,           route: ROUTES.BANNERS        },
  { group: 'Navegación', label: 'FAQs',             icon: HelpCircle,      route: ROUTES.FAQS           },
  { group: 'Navegación', label: 'Anuncios',         icon: Megaphone,       route: ROUTES.ANNOUNCEMENTS  },
  { group: 'Navegación', label: 'Eventos',          icon: Calendar,        route: ROUTES.EVENTS         },
  { group: 'Navegación', label: 'Tiendas',          icon: Store,           route: ROUTES.STORES         },
  { group: 'Navegación', label: 'Categorías',       icon: FolderTree,      route: ROUTES.CATEGORIES     },
  { group: 'Navegación', label: 'Cupones',          icon: Ticket,          route: ROUTES.COUPONS        },
  { group: 'Navegación', label: 'Usuarios',         icon: Users,           route: ROUTES.USERS          },
  { group: 'Navegación', label: 'Analytics',        icon: BarChart2,       route: ROUTES.ANALYTICS      },
  { group: 'Navegación', label: 'Configuración',    icon: Settings,        route: ROUTES.SETTINGS       },
] as const;

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useThemeStore();

  function go(route: string) {
    navigate(route);
    onOpenChange(false);
  }

  function doLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-modal w-full max-w-lg -translate-x-1/2 rounded-xl border border-warm-200 bg-white shadow-2xl animate-slide-down focus:outline-none"
          aria-label="Paleta de comandos"
        >
          <Command loop>
            <CommandInput placeholder="Buscar páginas, acciones…" autoFocus />
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>

              <CommandGroup heading="Navegar a">
                {NAV_ITEMS.map((item) => (
                  <CommandItem
                    key={item.route}
                    value={item.label}
                    onSelect={() => go(item.route)}
                  >
                    <item.icon size={15} className="text-warm-400" />
                    {item.label}
                    {'shortcut' in item && item.shortcut && (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Tema">
                {[
                  { label: 'Modo claro',   value: 'light',  icon: Sun     },
                  { label: 'Modo oscuro',  value: 'dark',   icon: Moon    },
                  { label: 'Sistema',      value: 'system', icon: Monitor },
                ].map((t) => (
                  <CommandItem
                    key={t.value}
                    value={`tema ${t.label}`}
                    onSelect={() => { setTheme(t.value as 'light' | 'dark' | 'system'); onOpenChange(false); }}
                  >
                    <t.icon size={15} className="text-warm-400" />
                    {t.label}
                    {theme === t.value && <CommandShortcut>✓</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Sesión">
                <CommandItem value="cerrar sesión logout" onSelect={doLogout}>
                  <LogOut size={15} className="text-danger-400" />
                  <span className="text-danger-600">Cerrar sesión</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>

            {/* Footer hint */}
            <div className="flex items-center gap-3 border-t border-warm-100 px-4 py-2 text-[10px] text-warm-400">
              <span><kbd className="font-mono">↑↓</kbd> navegar</span>
              <span><kbd className="font-mono">↵</kbd> seleccionar</span>
              <span><kbd className="font-mono">Esc</kbd> cerrar</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Hook para abrir/cerrar la paleta con Ctrl+K / Cmd+K */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { open, setOpen };
}
