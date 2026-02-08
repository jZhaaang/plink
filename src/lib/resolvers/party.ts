import { Party, PartyRow } from '../models';
import { parties } from '../supabase/storage/parties';

export async function resolveParty(party: PartyRow): Promise<Party> {
  const bannerUrlMap = party.banner_path
    ? await parties.getUrls([party.banner_path])
    : null;
  return {
    ...party,
    bannerUrl: bannerUrlMap?.get(party.banner_path!) ?? null,
  };
}
