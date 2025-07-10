import { PartyOverview } from '@/types/models';
import { useEffect, useState } from 'react';
import { getLinksByPartyId, getPartyMembers, getUserParties } from '../queries';
import { useUserId } from './useUserId';

export function usePartyOverviews() {
  const { userId, loading: userLoading } = useUserId();
  const [partyOverviews, setPartyOverviews] = useState<PartyOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || userLoading) return;
    const fetchData = async () => {
      try {
        const { data: parties, error: partiesError } = await getUserParties(userId);
        if (!parties || partiesError) throw partiesError;

        const promises = parties.map(async (party) => {
          const { data: links, error: linksError } = await getLinksByPartyId(party.id, false, 1);
          if (!links || linksError) throw linksError;

          const { data: members, error: membersError } = await getPartyMembers(party.id);
          if (!members || membersError) throw membersError;

          const partyMembers = members.map((member) => member.users);

          return {
            party,
            partyMembers,
            recentLink: links[0],
          };
        });

        const enriched = await Promise.all(promises);
        setPartyOverviews(enriched);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userLoading]);

  return { partyOverviews, loading, error };
}
