import { getPartyDetailById } from '../../../lib/supabase/queries/parties';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import { PartyDetail } from '../../../lib/models';
import { resolveLink } from '../../../lib/resolvers/link';
import { Image } from 'expo-image';

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

    const avatarUrls = members.map((m) => m.avatarUrl);
    const bannerUrls = resolvedLinks.map((l) => l.bannerUrl);

    const prefetchUrls = [...bannerUrls, ...avatarUrls].filter(
      (url): url is string => typeof url === 'string' && url.length > 0,
    );
    await Promise.all(prefetchUrls.map((url) => Image.prefetch(url)));

    return {
      ...resolvedParty,
      members,
      links: resolvedLinks,
    } as PartyDetail;
  }, [partyId]);

  return { party: data ?? null, ...rest };
}
