import { Party, PartyRow } from '../models';
import { parties } from '../supabase/storage/parties';

export async function resolveParty(party: PartyRow): Promise<Party> {
  return {
    ...party,
    bannerUrl: party.banner_path ? await parties.getUrl(party.id) : null,
  };
}
