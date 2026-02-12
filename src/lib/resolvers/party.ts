import { Party, PartyRow } from '../models';
import { parties as partiesStorage } from '../supabase/storage/parties';

export async function resolveParty(party: PartyRow): Promise<Party> {
  if (!party.banner_path) return { ...party, bannerUrl: null };

  try {
    const bannerUrlMap = await partiesStorage.getUrls([party.banner_path]);
    return { ...party, bannerUrl: bannerUrlMap.get(party.banner_path) ?? null };
  } catch {
    return { ...party, bannerUrl: null };
  }
}
