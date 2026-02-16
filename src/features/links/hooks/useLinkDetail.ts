import { Image } from 'expo-image';
import { LinkPostWithMedia, Profile } from '../../../lib/models';
import {
  resolveLink,
  resolveLinkPostMediaItems,
} from '../../../lib/resolvers/link';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { getLinkDetailById } from '../../../lib/supabase/queries/links';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';

export function useLinkDetail(linkId: string) {
  const { data: link, ...rest } = useQuery({
    queryKey: queryKeys.links.detail(linkId),
    queryFn: async () => {
      const rawLink = await getLinkDetailById(linkId);

      if (!rawLink) {
        throw new Error('Link not found');
      }

      const [resolvedLink, members] = await Promise.all([
        resolveLink(rawLink),
        Promise.all(
          rawLink.link_members.map((lm) => resolveProfile(lm.profiles)),
        ),
      ]);

      const profilesMap = new Map<string, Profile>(
        members.map((p) => [p.id, p]),
      );

      const allMedia = rawLink.link_posts.flatMap(
        (post) => post.link_post_media,
      );
      const mediaMap = await resolveLinkPostMediaItems(allMedia);

      let totalMediaCount = 0;
      const posts: LinkPostWithMedia[] = rawLink.link_posts.map((post) => {
        const owner = profilesMap.get(post.owner_id);
        if (!owner) throw new Error('Error retrieving owner for link post');

        const media = post.link_post_media
          .map((m) => mediaMap.get(m.id))
          .filter((m): m is NonNullable<typeof m> => !!m);

        totalMediaCount += media.length;
        return { ...post, owner, media };
      });

      const avatarUrls = members.map((m) => m.avatarUrl);
      const prefetchUrls = [resolvedLink.bannerUrl, ...avatarUrls].filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      );
      await Promise.all(prefetchUrls.map((url) => Image.prefetch(url)));

      return {
        ...resolvedLink,
        members,
        posts,
        postCount: posts.length,
        mediaCount: totalMediaCount,
      };
    },
    enabled: !!linkId,
  });

  return {
    link,
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
