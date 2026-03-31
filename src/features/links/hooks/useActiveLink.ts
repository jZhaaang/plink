import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getActiveLinkDetailByUserId } from '../../../lib/supabase/queries/links';
import { queryKeys } from '../../../lib/queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import { LinkDetail } from '../../../lib/models';
import { resolveLink } from '../../../lib/resolvers/link';
import { resolveProfile } from '../../../lib/resolvers/profile';

export function useActiveLink() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.links.active(userId),
    queryFn: async (): Promise<LinkDetail | null> => {
      if (!userId) return null;
      const rawLink = await getActiveLinkDetailByUserId(userId);
      if (!rawLink) return null;
      const postCount = rawLink.link_posts.length;
      const mediaCount = rawLink.link_posts.reduce(
        (sum, p) => sum + p.link_post_media.length,
        0,
      );
      const locations = [...rawLink.link_locations].sort(
        (a, b) => a.order_index - b.order_index,
      );

      const [resolvedLink, resolvedMembers] = await Promise.all([
        resolveLink(rawLink),
        Promise.all(
          rawLink.link_members.map((lm) => resolveProfile(lm.profiles)),
        ),
      ]);

      const linkDetail: LinkDetail = {
        ...resolvedLink,
        members: resolvedMembers,
        postCount,
        mediaCount,
        locations,
      };

      queryClient.setQueryData(queryKeys.links.detail(rawLink.id), linkDetail);

      return linkDetail;
    },
    enabled: !!userId,
  });

  return {
    activeLink: data ?? null,
    loading: rest.isLoading,
    error: rest.isError,
    refetch: rest.refetch,
  };
}
