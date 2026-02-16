import { Image } from 'expo-image';
import { PartyListItem } from '../../../lib/models';
import { resolveParty } from '../../../lib/resolvers/party';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { getPartiesWithMembersByUserId } from '../../../lib/supabase/queries/parties';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';

export function usePartyListItems(userId: string | null) {
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.parties.list(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];

      const rawParties = await getPartiesWithMembersByUserId(userId);

      const partyListItems: PartyListItem[] = await Promise.all(
        rawParties.map(async (party) => {
          const [resolvedParty, members] = await Promise.all([
            await resolveParty(party),
            Promise.all(
              party.party_members.map((pm) => resolveProfile(pm.profiles)),
            ),
          ]);

          const avatarUrls = members.map((m) => m.avatarUrl);

          const prefetchUrls = [resolvedParty.bannerUrl, ...avatarUrls].filter(
            (url): url is string => typeof url === 'string' && url.length > 0,
          );
          await Promise.all(prefetchUrls.map((url) => Image.prefetch(url)));

          return { ...resolvedParty, members };
        }),
      );

      return partyListItems;
    },
    enabled: !!userId,
  });

  return {
    parties: data ?? [],
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
