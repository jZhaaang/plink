import { Party } from '../models';
import { parties } from '../supabase/storage/parties';

export async function toPartyResolved(party: Party) {
  return {
    ...party,
    avatarUrl: await parties.getUrl(party.id, 'avatar'),
    bannerUrl: await parties.getUrl(party.id, 'banner'),
  };
}
