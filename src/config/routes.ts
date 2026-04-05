/** Rutas del CMS como constantes tipadas */
export const ROUTES = {
  LOGIN:      '/login',
  DASHBOARD:  '/dashboard',

  // Deals & Moderación
  DEALS:            '/deals',
  DEAL_DETAIL:      (id: number) => `/deals/${id}`,
  COUPONS:          '/coupons',
  MODERATION:       '/moderation',

  // CMS Content
  PAGES:            '/pages',
  PAGE_NEW:         '/pages/new',
  PAGE_EDIT:        (id: number) => `/pages/${id}/edit`,
  BANNERS:          '/banners',
  BANNER_NEW:       '/banners/new',
  BANNER_EDIT:      (id: number) => `/banners/${id}/edit`,
  FAQS:             '/faqs',
  ANNOUNCEMENTS:    '/announcements',
  EVENTS:           '/events',
  EVENT_NEW:        '/events/new',
  EVENT_EDIT:       (id: number) => `/events/${id}/edit`,

  // Catálogo
  STORES:           '/stores',
  STORE_NEW:        '/stores/new',
  STORE_EDIT:       (id: number) => `/stores/${id}/edit`,
  CATEGORIES:       '/categories',

  // Negocio
  AFFILIATE:        '/affiliate',
  ANALYTICS:        '/analytics',
  USERS:            '/users',
  USER_DETAIL:      (id: number) => `/users/${id}`,

  // Sistema
  SETTINGS:         '/settings',
} as const;

/** Nombres de ruta legibles para breadcrumbs */
export const ROUTE_LABELS: Record<string, string> = {
  dashboard:     'Dashboard',
  deals:         'Ofertas',
  coupons:       'Cupones',
  moderation:    'Moderación',
  pages:         'Páginas',
  banners:       'Banners',
  faqs:          'FAQs',
  announcements: 'Anuncios',
  events:        'Eventos',
  stores:        'Tiendas',
  categories:    'Categorías',
  affiliate:     'Afiliación',
  analytics:     'Analytics',
  users:         'Usuarios',
  settings:      'Configuración',
  new:           'Nuevo',
  edit:          'Editar',
};
