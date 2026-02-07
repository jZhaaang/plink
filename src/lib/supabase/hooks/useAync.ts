import { useCallback, useEffect, useRef, useState } from 'react';

type UseAsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFn();
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (err) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err as Error });
      }
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
