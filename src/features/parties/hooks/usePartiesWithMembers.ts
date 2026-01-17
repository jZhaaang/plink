import { useCallback, useEffect, useState } from 'react';
import { getPartiesWithMembersAndLinksByUserId } from '../../../lib/supabase/queries/parties';
import { PartyWithActivityResolved } from '../../../lib/models';
import { toPartyResolved } from '../../../lib/resolvers/party';
import { toProfileResolved } from '../../../lib/resolvers/profile';

export function usePartiesWithMembers(userId: string | null) {
  const [data, setData] = useState<PartyWithActivityResolved[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const rawParties = await getPartiesWithMembersAndLinksByUserId(userId);

      const partiesWithActivity = await Promise.all(
        rawParties.map(async (party) => {
          const partyResolved = await toPartyResolved(party);

          const members = await Promise.all(
            party.party_members.map((pm) => toProfileResolved(pm.profiles)),
          );

          const links = party.links ?? [];
          const activeLink = links.find((link) => !link.end_time) ?? null;

          const linkTimestamps = links
            .flatMap((l) => [l.created_at, l.end_time])
            .filter((t) => !!t);

          const lastActivityAt =
            linkTimestamps.length > 0
              ? linkTimestamps.sort(
                  (a, b) => new Date(b).getTime() - new Date(a).getTime(),
                )[0]
              : party.updated_at;

          return {
            ...partyResolved,
            members,
            activeLink,
            linkCount: links.length,
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
