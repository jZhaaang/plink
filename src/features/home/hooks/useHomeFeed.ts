import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Image } from 'expo-image';
import { queryKeys } from '../../../lib/queryKeys';
import {
  getRecentLinksByUserId,
  getActiveLinksByUserId,
} from '../../../lib/supabase/queries/links';
import {
  resolveLink,
  resolveLinkPostMediaItems,
} from '../../../lib/resolvers/link';
import { resolveParty } from '../../../lib/resolvers/party';
import type {
  ActiveFeedLink,
  HomeFeedLink,
  LinkDetail,
} from '../../../lib/models';
import { resolveProfile } from '../../../lib/resolvers/profile';

const PAGE_SIZE = 3;

export function useHomeFeed(userId: string) {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: feedLoading,
    error: feedError,
    refetch: refetchFeed,
  } = useInfiniteQuery({
    queryKey: queryKeys.home.feed(userId),
    queryFn: async ({ pageParam = 0 }) => {
      const rawLinks = await getRecentLinksByUserId(
        userId,
        pageParam,
        PAGE_SIZE,
      );

      const resolved: HomeFeedLink[] = await Promise.all(
        rawLinks.map(async (link) => {
          const postCount = link.link_posts.length;
          const mediaCount = link.link_posts.reduce(
            (sum, p) => sum + p.link_post_media.length,
            0,
          );

          const [resolvedLink, resolvedParty, resolvedMembers] =
            await Promise.all([
              resolveLink(link),
              resolveParty(link.parties),
              Promise.all(
                link.link_members.map((lm) => resolveProfile(lm.profiles)),
              ),
            ]);

          const allRawMedia = link.link_posts.flatMap((p) => p.link_post_media);
          const mediaMap = await resolveLinkPostMediaItems(allRawMedia);
          const allMedia = Array.from(mediaMap.values());

          if (resolvedParty.avatarUrl) Image.prefetch(resolvedParty.avatarUrl);
          resolvedMembers.forEach((m) => {
            if (m.avatarUrl) Image.prefetch(m.avatarUrl);
          });

          const linkDetail: LinkDetail = {
            ...resolvedLink,
            members: resolvedMembers,
            postCount,
            mediaCount,
          };

          queryClient.setQueryData(queryKeys.links.detail(link.id), linkDetail);

          return {
            ...resolvedLink,
            party: resolvedParty,
            members: resolvedMembers,
            media: allMedia,
            postCount,
            mediaCount,
          };
        }),
      );

      return resolved;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    enabled: !!userId,
  });

  const {
    data: activeLinks,
    isLoading: activeLoading,
    refetch: refetchActive,
  } = useQuery({
    queryKey: queryKeys.home.activeLinks(userId),
    queryFn: async () => {
      const rawLinks = await getActiveLinksByUserId(userId);

      const resolved: ActiveFeedLink[] = await Promise.all(
        rawLinks.map(async (link) => {
          const postCount = link.link_posts.length;
          const mediaCount = link.link_posts.reduce(
            (sum, p) => sum + p.link_post_media.length,
            0,
          );

          const [resolvedLink, resolvedParty, resolvedMembers] =
            await Promise.all([
              resolveLink(link),
              resolveParty(link.parties),
              Promise.all(
                link.link_members.map((lm) => resolveProfile(lm.profiles)),
              ),
            ]);

          if (resolvedParty.avatarUrl) Image.prefetch(resolvedParty.avatarUrl);
          resolvedMembers.forEach((m) => {
            if (m.avatarUrl) Image.prefetch(m.avatarUrl);
          });

          const linkDetail: LinkDetail = {
            ...resolvedLink,
            members: resolvedMembers,
            postCount,
            mediaCount,
          };

          queryClient.setQueryData(queryKeys.links.detail(link.id), linkDetail);

          return {
            ...linkDetail,
            party: resolvedParty,
          };
        }),
      );

      const sorted = resolved.sort((a, b) => {
        const aIsMember = a.members.some((m) => m.id === userId);
        const bIsMember = b.members.some((m) => m.id === userId);
        if (aIsMember && !bIsMember) return -1;
        if (!aIsMember && bIsMember) return 1;
        return 0;
      });

      return sorted;
    },
    enabled: !!userId,
  });

  const feedLinks = data?.pages.flat() ?? [];

  return {
    feedLinks,
    activeLinks: activeLinks ?? [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    feedLoading,
    activeLoading,
    error: feedError,
    refetch: () => {
      refetchFeed();
      refetchActive();
    },
  };
}
