import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RequireRole } from '@/features/auth/RequireRole';

/* ── Lazy-loaded pages ── */
const LoginPage           = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage       = lazy(() => import('@/features/dashboard/DashboardPage'));
const DealsListPage       = lazy(() => import('@/features/deals/DealsListPage'));
const DealDetailPage      = lazy(() => import('@/features/deals/DealDetailPage'));
const CouponsListPage     = lazy(() => import('@/features/coupons/CouponsListPage'));
const ModerationPage      = lazy(() => import('@/features/moderation/ModerationPage'));
const PagesListPage       = lazy(() => import('@/features/pages/PagesListPage'));
const PageEditorPage      = lazy(() => import('@/features/pages/PageEditorPage'));
const BannersListPage     = lazy(() => import('@/features/banners/BannersListPage'));
const BannerEditorPage    = lazy(() => import('@/features/banners/BannerEditorPage'));
const FaqsPage            = lazy(() => import('@/features/faqs/FaqsPage'));
const AnnouncementsPage   = lazy(() => import('@/features/announcements/AnnouncementsPage'));
const EventsListPage      = lazy(() => import('@/features/events/EventsListPage'));
const EventEditorPage     = lazy(() => import('@/features/events/EventEditorPage'));
const StoresListPage      = lazy(() => import('@/features/stores/StoresListPage'));
const StoreEditorPage     = lazy(() => import('@/features/stores/StoreEditorPage'));
const CategoriesPage      = lazy(() => import('@/features/categories/CategoriesPage'));
const AffiliateReportPage = lazy(() => import('@/features/affiliate/AffiliateReportPage'));
const AnalyticsPage       = lazy(() => import('@/features/analytics/AnalyticsPage'));
const UsersListPage       = lazy(() => import('@/features/users/UsersListPage'));
const UserDetailPage      = lazy(() => import('@/features/users/UserDetailPage'));
const SettingsPage        = lazy(() => import('@/features/settings/SettingsPage'));

/* ── Fallback de carga ── */
function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm-200 border-t-primary-500" />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-6xl font-bold text-warm-200">404</p>
      <p className="text-lg font-medium text-warm-700">Página no encontrada</p>
      <a href="/dashboard" className="text-sm text-primary-500 hover:underline">
        Volver al dashboard
      </a>
    </div>
  );
}

/* ── Wrapper con Suspense para cada lazy page ── */
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/* ── Router ── */
const router = createBrowserRouter([
  {
    path: '/login',
    element: <S><LoginPage /></S>,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <S><DashboardPage /></S> },

      // Deals & Moderación
      {
        path: 'deals',
        element: (
          <RequireRole roles={['moderator', 'admin', 'super_admin']}>
            <S><DealsListPage /></S>
          </RequireRole>
        ),
      },
      { path: 'deals/:id', element: <S><DealDetailPage /></S> },
      { path: 'coupons',   element: <S><CouponsListPage /></S> },
      {
        path: 'moderation',
        element: (
          <RequireRole roles={['moderator', 'admin', 'super_admin']}>
            <S><ModerationPage /></S>
          </RequireRole>
        ),
      },

      // CMS Content
      { path: 'pages',             element: <S><PagesListPage /></S> },
      { path: 'pages/new',         element: <S><PageEditorPage /></S> },
      { path: 'pages/:id/edit',    element: <S><PageEditorPage /></S> },
      { path: 'banners',           element: <S><BannersListPage /></S> },
      { path: 'banners/new',       element: <S><BannerEditorPage /></S> },
      { path: 'banners/:id/edit',  element: <S><BannerEditorPage /></S> },
      { path: 'faqs',              element: <S><FaqsPage /></S> },
      { path: 'announcements',     element: <S><AnnouncementsPage /></S> },
      { path: 'events',            element: <S><EventsListPage /></S> },
      { path: 'events/new',        element: <S><EventEditorPage /></S> },
      { path: 'events/:id/edit',   element: <S><EventEditorPage /></S> },

      // Catálogo
      {
        path: 'stores',
        element: (
          <RequireRole roles={['affiliate_manager', 'admin', 'super_admin']}>
            <S><StoresListPage /></S>
          </RequireRole>
        ),
      },
      { path: 'stores/new',       element: <S><StoreEditorPage /></S> },
      { path: 'stores/:id/edit',  element: <S><StoreEditorPage /></S> },
      {
        path: 'categories',
        element: (
          <RequireRole roles={['admin', 'super_admin']}>
            <S><CategoriesPage /></S>
          </RequireRole>
        ),
      },

      // Negocio
      {
        path: 'affiliate',
        element: (
          <RequireRole roles={['affiliate_manager', 'admin', 'super_admin']}>
            <S><AffiliateReportPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'analytics',
        element: (
          <RequireRole roles={['admin', 'super_admin']}>
            <S><AnalyticsPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'users',
        element: (
          <RequireRole roles={['moderator', 'admin', 'super_admin']}>
            <S><UsersListPage /></S>
          </RequireRole>
        ),
      },
      { path: 'users/:id', element: <S><UserDetailPage /></S> },

      // Sistema
      {
        path: 'settings',
        element: (
          <RequireRole roles={['admin', 'super_admin']}>
            <S><SettingsPage /></S>
          </RequireRole>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          classNames: { toast: 'font-body text-sm' },
        }}
      />

      {import.meta.env.VITE_APP_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
