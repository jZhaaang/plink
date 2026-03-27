import { getPartyDetailById } from '../../../lib/supabase/queries/parties';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { PartyDetail } from '../../../lib/models';
import { resolveLink } from '../../../lib/resolvers/link';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';

export function usePartyDetail(partyId: string) {
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.parties.detail(partyId),
    queryFn: async () => {
      if (!partyId) return null;

      const rawParty = await getPartyDetailById(partyId);
      const activeRaw = rawParty.active_link?.[0] ?? null;

      const [resolvedParty, resolvedMembers, resolvedActiveLink] =
        await Promise.all([
          resolveParty(rawParty),
          Promise.all(
            rawParty.party_members.map((pm) => resolveProfile(pm.profiles)),
          ),
          activeRaw ? resolveLink(activeRaw) : Promise.resolve(null),
        ]);

      const avatarUrls = resolvedMembers.map((m) => m.avatarUrl);

      const prefetchUrls = [
        resolvedParty.bannerUrl,
        resolvedParty.avatarUrl,
        ...avatarUrls,
      ].filter(
        (url): url is string => typeof url === 'string' && url.length > 0,
      );
      prefetchUrls.map((url) => Image.prefetch(url));

      return {
        ...resolvedParty,
        members: resolvedMembers,
        activeLink: resolvedActiveLink,
        linkCount: rawParty.link_count[0].count,
      } as PartyDetail;
    },
    enabled: !!partyId,
  });

  return {
    party: data ?? null,
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
