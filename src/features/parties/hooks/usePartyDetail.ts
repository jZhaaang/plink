import { useCallback, useEffect, useState } from 'react';
import { getPartyDetailById } from '../../../lib/supabase/queries/parties';
import { PartyDetail } from '../../../lib/models';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';

export function usePartyDetail(partyId: string) {
  const [data, setData] = useState<PartyDetail | null>(null);
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
        resolveParty(rawParty),
        Promise.all(
          rawParty.party_members.map((pm) => resolveProfile(pm.profiles)),
        ),
      ]);

      setData({
        ...partyResolved,
        members,
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

  return { data, loading, error, refetch: fetchData };
}
