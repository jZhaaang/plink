import { Party } from '../models';
import { parties } from '../supabase/storage/parties';

export async function toPartyResolved(party: Party) {
  return {
    ...party,
    avatarUrl: party.avatar_path
      ? await parties.getUrl(party.id, 'avatar')
      : null,
    bannerUrl: party.banner_path
      ? await parties.getUrl(party.id, 'banner')
      : null,
  };
}
