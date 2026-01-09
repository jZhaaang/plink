import { useCallback, useEffect, useState } from 'react';
import { getPartyById } from '../../../lib/supabase/queries/parties';
import { getPartyMembersByPartyId } from '../../../lib/supabase/queries/partyMembers';
import { getLinksByPartyId } from '../../../lib/supabase/queries/links';
import { PartyWithMembersResolved, Link } from '../../../lib/models';
import { toPartyResolved } from '../../../lib/resolvers/party';
import { toProfileResolved } from '../../../lib/resolvers/profile';
import { getUserProfile } from '../../../lib/supabase/queries/users';

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
      const party = await getPartyById(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      const partyResolved = await toPartyResolved(party);

      const members = await getPartyMembersByPartyId(partyId);
      const profiles = await Promise.all(
        members.map(async (member) => {
          const profile = await getUserProfile(member.user_id);
          return toProfileResolved(profile);
        }),
      );

      const links = (await getLinksByPartyId(partyId)) ?? [];

      setData({
        party: { ...partyResolved, members: profiles },
        links,
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
