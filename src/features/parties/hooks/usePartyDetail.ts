import { getPartyDetailById } from '../../../lib/supabase/queries/parties';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import { PartyDetail } from '../../../lib/models';
import { resolveLink } from '../../../lib/resolvers/link';

export function usePartyDetail(partyId: string) {
  const { data, ...rest } = useAsync(async () => {
    if (!partyId) return null;

    const rawParty = await getPartyDetailById(partyId);

    if (!rawParty) {
      throw new Error('Party not found');
    }

    const [resolvedParty, members, resolvedLinks] = await Promise.all([
      resolveParty(rawParty),
      Promise.all(
        rawParty.party_members.map((pm) => resolveProfile(pm.profiles)),
      ),
      Promise.all((rawParty.links ?? []).map((link) => resolveLink(link))),
    ]);

    return {
      ...resolvedParty,
      members,
      links: resolvedLinks,
    } as PartyDetail;
  }, [partyId]);

  return { party: data ?? null, ...rest };
}
