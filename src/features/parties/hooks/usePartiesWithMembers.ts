import { useCallback, useEffect, useState } from 'react';
import { getPartiesByUserId } from '../../../lib/supabase/queries/parties';
import { PartyWithActivityResolved } from '../../../lib/models';
import { toPartyResolved } from '../../../lib/resolvers/party';
import { getPartyMembersByPartyId } from '../../../lib/supabase/queries/partyMembers';
import { toProfileResolved } from '../../../lib/resolvers/profile';
import { getUserProfile } from '../../../lib/supabase/queries/users';
import { getLinksByPartyId } from '../../../lib/supabase/queries/links';

export function usePartiesWithMembers(userId: string | null) {
  const [data, setData] = useState<PartyWithActivityResolved[]>([]);
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

      const partiesWithActivity = await Promise.all(
        parties.map(async (party) => {
          const members = await getPartyMembersByPartyId(party.id);
          const profiles = await Promise.all(
            members.map(async (member) => {
              const profile = await getUserProfile(member.user_id);
              return await toProfileResolved(profile);
            }),
          );

          const links = (await getLinksByPartyId(party.id)) ?? [];
          const hasActiveLink = links.some((link) => !link.end_time);

          // Compute last activity from most recent link timestamp
          const linkTimestamps = links
            .flatMap((l) => [l.created_at, l.end_time])
            .filter((t): t is string => !!t);
          const lastActivityAt =
            linkTimestamps.length > 0
              ? linkTimestamps.sort(
                  (a, b) => new Date(b).getTime() - new Date(a).getTime(),
                )[0]
              : party.updated_at;

          return {
            ...party,
            members: profiles,
            hasActiveLink,
            lastActivityAt,
          };
        }),
      );

      setData(partiesWithActivity);
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
