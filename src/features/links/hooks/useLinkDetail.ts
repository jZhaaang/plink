import { LinkPostWithMedia, Profile } from '../../../lib/models';
import {
  resolveLink,
  resolveLinkPostMediaItems,
} from '../../../lib/resolvers/link';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import { getLinkDetailById } from '../../../lib/supabase/queries/links';

export function useLinkDetail(linkId: string) {
  const { data: link, ...rest } = useAsync(async () => {
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

    const profilesMap = new Map<string, Profile>(members.map((p) => [p.id, p]));

    const allMedia = rawLink.link_posts.flatMap((post) => post.link_post_media);
    const mediaMap = await resolveLinkPostMediaItems(allMedia);

    let totalMediaCount = 0;
    const posts: LinkPostWithMedia[] = rawLink.link_posts.map((post) => {
      const owner = profilesMap.get(post.owner_id)!;
      const media = post.link_post_media.map((m) => mediaMap.get(m.id)!);
      totalMediaCount += media.length;
      return { ...post, owner, media };
    });

    return {
      ...resolvedLink,
      members,
      posts,
      postCount: posts.length,
      mediaCount: totalMediaCount,
    };
  }, [linkId]);

  return { link, ...rest };
}
