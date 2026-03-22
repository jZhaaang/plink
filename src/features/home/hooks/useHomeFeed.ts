import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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
import type { ActiveFeedLink, HomeFeedLink } from '../../../lib/models';
import { resolveProfile } from '../../../lib/resolvers/profile';

const PAGE_SIZE = 3;

export function useHomeFeed(userId: string) {
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
        rawLinks.map(async (raw) => {
          const [resolvedLink, resolvedParty, resolvedMembers] =
            await Promise.all([
              resolveLink(raw),
              resolveParty(raw.parties),
              Promise.all(
                raw.link_members.map((lm) => resolveProfile(lm.profiles)),
              ),
            ]);

          const allRawMedia = raw.link_posts.flatMap((p) => p.link_post_media);
          const mediaMap = await resolveLinkPostMediaItems(allRawMedia);
          const allMedia = Array.from(mediaMap.values());

          if (resolvedParty.avatarUrl) Image.prefetch(resolvedParty.avatarUrl);
          resolvedMembers.forEach((m) => {
            if (m.avatarUrl) Image.prefetch(m.avatarUrl);
          });

          return {
            ...resolvedLink,
            party: resolvedParty,
            members: resolvedMembers,
            media: allMedia,
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
        rawLinks.map(async (raw) => {
          const [resolvedParty, resolvedMembers] = await Promise.all([
            resolveParty(raw.parties),
            Promise.all(
              raw.link_members.map((lm) => resolveProfile(lm.profiles)),
            ),
          ]);

          if (resolvedParty.avatarUrl) Image.prefetch(resolvedParty.avatarUrl);
          resolvedMembers.forEach((m) => {
            if (m.avatarUrl) Image.prefetch(m.avatarUrl);
          });

          return {
            ...raw,
            party: resolvedParty,
            members: resolvedMembers,
            mediaCount: raw.link_posts[0].count ?? 0,
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
    loading: feedLoading || activeLoading,
    error: feedError,
    refetch: () => {
      refetchFeed();
      refetchActive();
    },
  };
}
