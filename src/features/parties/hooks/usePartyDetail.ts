import { useCallback, useEffect, useState } from 'react';
import { getPartyDetailById } from '../../../lib/supabase/queries/parties';
import { PartyWithMembersResolved, Link } from '../../../lib/models';
import { toPartyResolved } from '../../../lib/resolvers/party';
import { toProfileResolved } from '../../../lib/resolvers/profile';

type PartyDetailData = {
  party: PartyWithMembersResolved | null;
  links: Link[];
};

export function usePartyDetail(partyId: string) {
  const [data, setData] = useState<PartyDetailData>({ party: null, links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rawParty = await getPartyDetailById(partyId);

      if (!rawParty) {
        throw new Error('Party not found');
      }

      const [partyResolved, members] = await Promise.all([
        toPartyResolved(rawParty),
        Promise.all(
          rawParty.party_members.map((pm) => toProfileResolved(pm.profiles)),
        ),
      ]);

      setData({
        party: { ...partyResolved, members },
        links: rawParty.links ?? [],
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
}
