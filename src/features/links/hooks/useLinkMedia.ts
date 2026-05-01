import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '../../../lib/queryKeys';
import { getLinkMediaByLinkId } from '../../../lib/supabase/queries/linkMedia';
import { resolveLinkMedia } from '../../../lib/resolvers/link';

const PAGE_SIZE = 20;

export function useLinkMedia(linkId: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, ...rest } =
    useInfiniteQuery({
      queryKey: queryKeys.links.media(linkId),
      queryFn: async ({ pageParam = 0 }) => {
        const rows = await getLinkMediaByLinkId(linkId, pageParam, PAGE_SIZE);
        if (rows.length === 0) return [];
        return resolveLinkMedia(rows);
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === PAGE_SIZE ? allPages.length : undefined,
      enabled: !!linkId,
    });

  const allMedia = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data?.pages],
  );

  return {
    allMedia,
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
