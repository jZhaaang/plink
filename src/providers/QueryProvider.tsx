import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { captureError } from '../lib/telemetry/monitoring';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      captureError(error, {
        source: 'react-query',
        queryKey: JSON.stringify(query.queryKey),
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      captureError(error, {
        source: 'react-query-mutation',
        mutationKey: JSON.stringify(mutation.options.mutationKey ?? 'unknown'),
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
