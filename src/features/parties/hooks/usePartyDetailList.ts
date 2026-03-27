import { Image } from 'expo-image';
import { PartyDetail } from '../../../lib/models';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { getPartyDetailsByUserId } from '../../../lib/supabase/queries/parties';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { resolveLink } from '../../../lib/resolvers/link';

export function usePartyDetailList(userId: string | null) {
  const queryClient = useQueryClient();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.parties.list(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];

      const rawParties = await getPartyDetailsByUserId(userId);

      const partyDetails: PartyDetail[] = await Promise.all(
        rawParties.map(async (party) => {
          const activeRaw = party.active_link?.[0] ?? null;

          const [resolvedParty, resolvedMembers, resolvedActiveLink] =
            await Promise.all([
              resolveParty(party),
              Promise.all(
                party.party_members.map((pm) => resolveProfile(pm.profiles)),
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

          const partyDetail: PartyDetail = {
            ...resolvedParty,
            members: resolvedMembers,
            activeLink: resolvedActiveLink,
            linkCount: party.link_count[0].count,
          } as PartyDetail;

          queryClient.setQueryData(
            queryKeys.parties.detail(party.id),
            partyDetail,
          );

          return partyDetail;
        }),
      );

      return partyDetails;
    },
    enabled: !!userId,
  });

  return {
    partyDetails: data ?? [],
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
