import { getPartyDetailById } from '../../../lib/supabase/queries/parties';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { Image } from 'expo-image';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import { PartyDetail } from '../../../lib/models';

export function usePartyDetail(partyId: string) {
  const { data, ...rest } = useAsync(async () => {
    if (!partyId) return null;

    const rawParty = await getPartyDetailById(partyId);

    if (!rawParty) {
      throw new Error('Party not found');
    }

    const [resolvedParty, members] = await Promise.all([
      await resolveParty(rawParty),
      Promise.all(
        rawParty.party_members.map((pm) => resolveProfile(pm.profiles)),
      ),
    ]);

    const avatarUrls = members.map((m) => m.avatarUrl);
    await Promise.all(
      [resolvedParty.bannerUrl, ...avatarUrls].map((url) =>
        Image.prefetch(url),
      ),
    );

    return {
      ...resolvedParty,
      members,
      links: rawParty.links ?? [],
    } as PartyDetail;
  }, [partyId]);

  return { party: data ?? null, ...rest };
}
