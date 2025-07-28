import { LinkOverview } from '@/types/models';
import { useEffect, useState } from 'react';
import {
  getLinkById,
  getLinkMembers,
  getLinkPosts,
  getLinksByUserId,
  getPartyById,
} from '../queries';
import { resolveSignedUrlsForPosts } from '../utils/resolveSignedUrlsForPosts';
import { useUserId } from './useUserId';

type Result =
  | { linkOverview: LinkOverview | null; linkOverviews?: never }
  | { linkOverviews: LinkOverview[]; linkOverview?: never };

export function useLinkOverviews(options?: {
  offset?: number;
  limit?: number;
  linkId?: string;
}): Result & { loading: boolean; error: Error | null } {
  const { userId, loading: userLoading } = useUserId();
  const [linkOverviews, setLinkOverviews] = useState<LinkOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || userLoading) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error: linksError } = options?.linkId
          ? await getLinkById(options.linkId)
          : await getLinksByUserId(userId);

        if (!data || linksError) throw linksError;

        const links = Array.isArray(data) ? data : [data];

        const promises = links.map(async (link) => {
          const { data: party, error: partyError } = await getPartyById(link.party_id);
          if (!party || partyError) throw partyError;

          const { data: posts, error: postsError } = await getLinkPosts(link.id);
          if (!posts || postsError) throw postsError;

          const resolvedPosts = posts.length !== 0 ? await resolveSignedUrlsForPosts(posts) : [];

          const { data: members, error: membersError } = await getLinkMembers(link.id);
          if (!members || membersError) throw membersError;

          const linkMembers = members.map((member) => member.users);

          return {
            link,
            party,
            posts: resolvedPosts,
            linkMembers,
          };
        });

        const enriched = await Promise.all(promises);
        setLinkOverviews(enriched);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [options?.linkId, userId, userLoading]);

  const result = options?.linkId ? { linkOverview: linkOverviews[0] ?? null } : { linkOverviews };

  return { ...result, loading, error };
}
