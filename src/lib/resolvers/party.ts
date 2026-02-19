import { Party, PartyRow } from '../models';
import { parties as partiesStorage } from '../supabase/storage/parties';
import { logger } from '../telemetry/logger';

export async function resolveParty(party: PartyRow): Promise<Party> {
  if (!party.banner_path) return { ...party, bannerUrl: null };

  try {
    const bannerUrlMap = await partiesStorage.getUrls([party.banner_path]);
    const bannerUrl = bannerUrlMap.get(party.banner_path) ?? null;

    if (!bannerUrl) {
      logger.warn('Missing resolved banner URL for party', {
        partyId: party.id,
        bannerPath: party.banner_path,
      });
    }

    return { ...party, bannerUrl };
  } catch (error) {
    logger.error('Error resolving party banner URL', {
      partyId: party.id,
      bannerPath: party.banner_path,
      error,
    });
    return { ...party, bannerUrl: null };
  }
}
