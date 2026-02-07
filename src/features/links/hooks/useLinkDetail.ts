import { LinkPostWithMedia, Profile } from '../../../lib/models';
import { resolveLinkPostMedia } from '../../../lib/resolvers/link';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import { getLinkDetailById } from '../../../lib/supabase/queries/links';

export function useLinkDetail(linkId: string) {
  const { data: link, ...rest } = useAsync(async () => {
    const rawLink = await getLinkDetailById(linkId);

    if (!rawLink) {
      throw new Error('Link not found');
    }

    const members: Profile[] = await Promise.all(
      rawLink.link_members.map((lm) => resolveProfile(lm.profiles)),
    );

    const profilesMap = new Map<string, Profile>(members.map((p) => [p.id, p]));

    let totalMediaCount = 0;
    const posts: LinkPostWithMedia[] = await Promise.all(
      rawLink.link_posts.map(async (post) => {
        const owner = profilesMap.get(post.owner_id)!;
        const media = await Promise.all(
          post.link_post_media.map((m) => resolveLinkPostMedia(m)),
        );
        totalMediaCount += media.length;
        return { ...post, owner, media };
      }),
    );

    return {
      ...rawLink,
      members,
      posts,
      postCount: posts.length,
      mediaCount: totalMediaCount,
    };
  }, [linkId]);

  return { link, ...rest };
}
