import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '../../../lib/queryKeys';
import { getLinkMediaByLocationId } from '../../../lib/supabase/queries/linkMedia';
import { resolveLinkMedia } from '../../../lib/resolvers/link';
import { LinkMedia } from '../../../lib/models';

const PAGE_SIZE = 12;

export function useLocationMedia(
  linkId: string,
  locationId: string | null | undefined,
) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, ...rest } =
    useInfiniteQuery({
      queryKey: queryKeys.links.locationMedia(linkId, locationId),
      queryFn: async ({ pageParam = 0 }) => {
        const raw = await getLinkMediaByLocationId(
          linkId,
          locationId ?? null,
          pageParam,
          PAGE_SIZE,
        );
        return raw.length ? resolveLinkMedia(raw) : ([] as LinkMedia[]);
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === PAGE_SIZE ? allPages.length : undefined,
      enabled: !!linkId,
    });

  const media = useMemo(() => data?.pages.flat() ?? [], [data?.pages]);

  return {
    media,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loading: rest.isLoading,
    error: rest.error,
  };
}
