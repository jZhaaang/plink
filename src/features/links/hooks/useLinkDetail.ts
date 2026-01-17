import { useCallback, useEffect, useState } from 'react';
import { getLinkDetailById } from '../../../lib/supabase/queries/links';
import {
  LinkDetailResolved,
  LinkPostWithMediaResolved,
  ProfileResolved,
} from '../../../lib/models';
import { toProfileResolved } from '../../../lib/resolvers/profile';
import { toLinkPostMediaResolved } from '../../../lib/resolvers/link';

export function useLinkDetail(linkId: string) {
  const [data, setData] = useState<LinkDetailResolved | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rawLink = await getLinkDetailById(linkId);

      if (!rawLink) {
        throw new Error('Link not found');
      }

      const membersResolved = await Promise.all(
        rawLink.link_members.map((lm) => toProfileResolved(lm.profiles)),
      );
      const profilesMap = new Map<string, ProfileResolved>(
        membersResolved.map((p) => [p.id, p]),
      );

      let totalMediaCount = 0;
      const posts: LinkPostWithMediaResolved[] = await Promise.all(
        rawLink.link_posts.map(async (post) => {
          const owner = profilesMap.get(post.owner_id)!;

          const media = await Promise.all(
            post.link_post_media.map((m) => toLinkPostMediaResolved(m)),
          );

          totalMediaCount += media.length;

          return { ...post, owner, media };
        }),
      );

      setData({
        ...rawLink,
        members: membersResolved,
        posts,
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
