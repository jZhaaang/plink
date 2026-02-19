import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { logger } from '../lib/telemetry/logger';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error('React Query error', {
        source: 'react-query',
        queryKey: JSON.stringify(query.queryKey),
        error,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logger.error('React Query mutation error', {
        source: 'react-query-mutation',
        mutationKey: JSON.stringify(mutation.options.mutationKey ?? 'unknown'),
        error,
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      gcTime: 120 * 60 * 1000,
      retry: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { queryClient };
