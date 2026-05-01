import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { getPastLinkDetailsByPartyId } from '../../../lib/supabase/queries/links';
import { resolveLink } from '../../../lib/resolvers/link';
import { LinkDetail } from '../../../lib/models';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { Image } from 'expo-image';

const PAGE_SIZE = 10;

export function usePastLinks(partyId: string) {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, ...rest } =
    useInfiniteQuery({
      queryKey: queryKeys.parties.pastLinks(partyId),
      queryFn: async ({ pageParam = 0 }) => {
        const rawLinks = await getPastLinkDetailsByPartyId(
          partyId,
          pageParam,
          PAGE_SIZE,
        );

        const linkDetails: LinkDetail[] = await Promise.all(
          rawLinks.map(async (link) => {
            const locations = [...link.link_locations].sort(
              (a, b) => a.order_index - b.order_index,
            );

            const [resolvedLink, resolvedMembers] = await Promise.all([
              resolveLink(link),
              Promise.all(
                link.link_members.map((lm) => resolveProfile(lm.profiles)),
              ),
            ]);

            const avatarUrls = resolvedMembers.map((m) => m.avatarUrl);

            const prefetchUrls = avatarUrls.filter(
              (url): url is string => typeof url === 'string' && url.length > 0,
            );
            prefetchUrls.map((url) => Image.prefetch(url));

            const linkDetail: LinkDetail = {
              ...resolvedLink,
              members: resolvedMembers,
              mediaCount: link.link_media.length,
              locations,
            };

            queryClient.setQueryData(
              queryKeys.links.detail(link.id),
              linkDetail,
            );

            return linkDetail;
          }),
        );

        return linkDetails;
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
