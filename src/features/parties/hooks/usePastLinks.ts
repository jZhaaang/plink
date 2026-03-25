import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { getPastLinksByPartyId } from '../../../lib/supabase/queries/links';
import { resolveLink } from '../../../lib/resolvers/link';

const PAGE_SIZE = 10;

export function usePastLinks(partyId: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, ...rest } =
    useInfiniteQuery({
      queryKey: queryKeys.parties.pastLinks(partyId),
      queryFn: async ({ pageParam = 0 }) => {
        const rawLinks = await getPastLinksByPartyId(
          partyId,
          pageParam,
          PAGE_SIZE,
        );
        const resolved = await Promise.all(rawLinks.map(resolveLink));
        return resolved;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < PAGE_SIZE) return undefined;
        return allPages.length;
      },
      enabled: !!partyId,
    });

  const pastLinks = data?.pages.flat() ?? [];

  return {
    pastLinks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
