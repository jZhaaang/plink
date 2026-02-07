import { PartyListItem } from '../../../lib/models';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import { getPartiesWithMembersByUserId } from '../../../lib/supabase/queries/parties';

export function usePartyListItems(userId: string | null) {
  const { data, ...rest } = useAsync(async () => {
    if (!userId) return [];

    const rawParties = await getPartiesWithMembersByUserId(userId);

    const partyListItems: PartyListItem[] = await Promise.all(
      rawParties.map(async (party) => {
        const [resolvedParties, members] = await Promise.all([
          resolveParty(party),
          Promise.all(
            party.party_members.map((pm) => resolveProfile(pm.profiles)),
          ),
        ]);
        return { ...resolvedParties, members };
      }),
    );

    return partyListItems;
  }, [userId]);

  return { parties: data ?? [], ...rest };
}
