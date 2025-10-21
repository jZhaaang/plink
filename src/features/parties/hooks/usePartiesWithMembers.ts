import { useCallback, useEffect, useState } from 'react';
import { getPartiesByUserId } from '../../../lib/supabase/queries/parties';
import { PartyWithMembersResolved } from '../../../lib/models';
import { toPartyResolved } from '../../../lib/resolvers/party';
import { getPartyMembersByPartyId } from '../../../lib/supabase/queries/partyMembers';
import { toProfileResolved } from '../../../lib/resolvers/profile';
import { getUserProfile } from '../../../lib/supabase/queries/users';

export function usePartiesWithMembers(userId: string | null) {
  const [data, setData] = useState<PartyWithMembersResolved[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const parties = await Promise.all(
        (await getPartiesByUserId(userId)).map(async (party) => {
          const partyResolved = await toPartyResolved(party);
          return partyResolved;
        }),
      );

      const partiesWithMembers = await Promise.all(
        parties.map(async (party) => {
          const members = await getPartyMembersByPartyId(party.id);
          const profiles = await Promise.all(
            members.map(async (member) => {
              const profile = await getUserProfile(member.user_id);
              return await toProfileResolved(profile);
            }),
          );

          return {
            ...party,
            members: profiles,
          };
        }),
      );

      setData(partiesWithMembers);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { parties: data, loading, error, refetch: fetchData };
}
