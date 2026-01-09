import { useCallback, useEffect, useState } from 'react';
import { getLinkById } from '../../../lib/supabase/queries/links';
import { getLinkMembersByLinkId } from '../../../lib/supabase/queries/linkMembers';
import { getLinkPostsByLinkId } from '../../../lib/supabase/queries/linkPosts';
import { getMediaByPostId } from '../../../lib/supabase/queries/linkPostMedia';
import {
  LinkDetailResolved,
  LinkPostWithMediaResolved,
} from '../../../lib/models';
import { toProfileResolved } from '../../../lib/resolvers/profile';
import { toLinkPostMediaResolved } from '../../../lib/resolvers/link';
import { getUserProfile } from '../../../lib/supabase/queries/users';

export function useLinkDetail(linkId: string) {
  const [data, setData] = useState<LinkDetailResolved | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const link = await getLinkById(linkId);
      if (!link) {
        throw new Error('Link not found');
      }

      const members = await getLinkMembersByLinkId(linkId);
      const profiles = await Promise.all(
        members.map(async (member) => {
          const profile = await getUserProfile(member.user_id);
          return toProfileResolved(profile);
        }),
      );

      const posts = await getLinkPostsByLinkId(linkId);
      let totalMediaCount = 0;

      const postsWithMedia: LinkPostWithMediaResolved[] = await Promise.all(
        posts.map(async (post) => {
          const ownerProfile = await getUserProfile(post.owner_id);
          const owner = await toProfileResolved(ownerProfile);

          const rawMedia = await getMediaByPostId(post.id);
          const media = await Promise.all(
            rawMedia.map((m) => toLinkPostMediaResolved(m)),
          );

          totalMediaCount += media.length;

          return {
            ...post,
            owner,
            media,
          };
        }),
      );

      setData({
        ...link,
        members: profiles,
        posts: postsWithMedia,
        postCount: posts.length,
        mediaCount: totalMediaCount,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [linkId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { link: data, loading, error, refetch: fetchData };
}
