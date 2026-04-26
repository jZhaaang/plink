import { useCallback, useEffect, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { SearchSuggestion } from '../../../lib/mapbox/types';
import { retrievePlace, suggestPlaces } from '../../../lib/mapbox/placeSearch';

interface Options {
  initialQuery?: string;
  proximity?: { latitude: number; longitude: number } | null;
}

export function useLocationSearch({ initialQuery = '', proximity }: Options) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken] = useState(() => randomUUID());

  const trimmed = query.trim();
  const shouldSearch = trimmed.length >= 3 && trimmed !== initialQuery;

  useEffect(() => {
    if (!shouldSearch) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const suggestions = await suggestPlaces(
          trimmed,
          sessionToken,
          proximity ?? undefined,
        );
        setResults(suggestions);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [trimmed, sessionToken, shouldSearch, proximity]);

  const retrieveSelected = useCallback(
    (mapboxId: string) => retrievePlace(mapboxId, sessionToken),
    [sessionToken],
  );

  const reset = useCallback((newQuery = '') => {
    setQuery(newQuery);
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    shouldSearch,
    retrieveSelected,
    reset,
  };
}
