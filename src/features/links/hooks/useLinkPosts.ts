import { resolveProfile } from '../../../lib/resolvers/profile';
import { LinkPostMedia, LinkPostWithMedia } from '../../../lib/models';
import { resolveLinkPostMediaItems } from '../../../lib/resolvers/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { getLinkPostsByLinkId } from '../../../lib/supabase/queries/linkPosts';
import { useMemo } from 'react';

const PAGE_SIZE = 10;

export function useLinkPosts(linkId: string) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, ...rest } =
    useInfiniteQuery({
      queryKey: queryKeys.links.posts(linkId),
      queryFn: async ({ pageParam = 0 }) => {
        const rawPosts = await getLinkPostsByLinkId(
          linkId,
          pageParam,
          PAGE_SIZE,
        );

        const profilesMap = new Map<
          string,
          Awaited<ReturnType<typeof resolveProfile>>
        >();
        await Promise.all(
          rawPosts.map(async (post) => {
            if (!profilesMap.has(post.owner_id)) {
              const resolved = await resolveProfile(post.profiles);
              profilesMap.set(post.owner_id, resolved);
            }
          }),
        );

        const allRawMedia = rawPosts.flatMap((p) => p.link_post_media);
        const mediaMap = await resolveLinkPostMediaItems(allRawMedia);

        const posts: LinkPostWithMedia[] = rawPosts.map((post) => {
          const owner = profilesMap.get(post.owner_id);
          if (!owner) throw new Error('Error retrieving owner for link post');

          const media = post.link_post_media
            .map((m) => mediaMap.get(m.id))
            .filter((m): m is LinkPostMedia => !!m);

          return { ...post, owner, media };
        });

        return posts;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === PAGE_SIZE ? allPages.length : undefined,
      enabled: !!linkId,
    });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data?.pages],
  );

  const allMedia = useMemo(() => posts.flatMap((post) => post.media), [posts]);

  return {
    posts,
    allMedia,
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
