import { PartyWithRecentLink } from '@/types/models';
import { useEffect, useState } from 'react';
import { getLinksByPartyId, getUserParties } from '../queries';
import { useUserId } from './useUserId';

export function usePartiesWithRecentLink() {
  const { userId, loading: userLoading } = useUserId();
  const [parties, setParties] = useState<PartyWithRecentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || userLoading) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: parties, error: partiesError } = await getUserParties(userId);
        if (!parties || partiesError) throw partiesError;

        const promises = parties.map(async (party) => {
          const { data: links, error: linkError } = await getLinksByPartyId(party.id, false, 1);
          if (linkError) throw linkError;
          return {
            party,
            link: links?.[0] ?? null,
          };
        });

        const enriched = await Promise.all(promises);
        setParties(enriched);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userLoading]);

  return { parties, loading, error };
}
