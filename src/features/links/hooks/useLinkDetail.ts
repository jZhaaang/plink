import { Image } from 'expo-image';
import { resolveLink } from '../../../lib/resolvers/link';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { getLinkDetailById } from '../../../lib/supabase/queries/links';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';

export function useLinkDetail(linkId: string) {
  const { data: linkDetail, ...rest } = useQuery({
    queryKey: queryKeys.links.detail(linkId),
    queryFn: async () => {
      const rawLink = await getLinkDetailById(linkId);
      const postCount = rawLink.link_posts.length;
      const mediaCount = rawLink.link_posts.reduce(
        (sum, p) => sum + p.link_post_media.length,
        0,
      );
      const locations = [...rawLink.link_locations].sort(
        (a, b) => a.order_index - b.order_index,
      );

      if (!rawLink) {
        throw new Error('Link not found');
      }

      const [resolvedLink, resolvedMembers] = await Promise.all([
        resolveLink(rawLink),
        Promise.all(
          rawLink.link_members.map((lm) => resolveProfile(lm.profiles)),
        ),
      ]);

      const avatarUrls = resolvedMembers.map((m) => m.avatarUrl);

      const prefetchUrls = [resolvedLink.bannerUrl, ...avatarUrls].filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      );
      prefetchUrls.map((url) => Image.prefetch(url));

      return {
        ...resolvedLink,
        members: resolvedMembers,
        postCount,
        mediaCount,
        locations,
      };
    },
    enabled: !!linkId,
  });

  return {
    linkDetail,
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
