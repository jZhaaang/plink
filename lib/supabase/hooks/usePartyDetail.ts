import { PartyDetail } from '@/types/models';
import { useEffect, useState } from 'react';
import {
  getLinkMembers,
  getLinkPosts,
  getLinksByPartyId,
  getPartyById,
  getPartyMembers,
} from '../queries';

export function usePartyDetail(partyId: string) {
  const [partyDetail, setPartyDetail] = useState<PartyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: party, error: partyError } = await getPartyById(partyId);
        if (!party || partyError) throw partyError;

        const { data: partyMembersData, error: partyMembersError } = await getPartyMembers(partyId);
        if (!partyMembersData || partyMembersError) throw partyMembersError;

        const partyMembers = partyMembersData.map((member) => member.users);

        const { data: links, error: linksError } = await getLinksByPartyId(partyId);
        if (!links || linksError) throw linksError;

        const promises = links.map(async (link) => {
          const { data: posts, error: postsError } = await getLinkPosts(link.id);
          if (!posts || postsError) throw postsError;

          const { data: linkMembersData, error: linkMembersError } = await getLinkMembers(link.id);
          if (!linkMembersData || linkMembersError) throw linkMembersError;

          const linkMembers = linkMembersData.map((member) => member.users);

          return {
            ...link,
            members: linkMembers,
            posts,
          };
        });

        const linkDetails = await Promise.all(promises);
        setPartyDetail({ party: { ...party, members: partyMembers }, links: linkDetails });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [partyId]);

  return { partyDetail, loading, error };
}
