import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30s — datos frescos sin refetch
      gcTime: 5 * 60_000,         // 5 min en cache tras desmontar
      retry: 1,                    // 1 reintento en error
      refetchOnWindowFocus: true,  // Refrescar al volver a la pestaña
    },
    mutations: {
      retry: 0,
    },
  },
});
