import { Party, PartyRow } from '../models';
import { parties as partiesStorage } from '../media-service/parties';
import { logger } from '../telemetry/logger';

export async function resolveParty(party: PartyRow): Promise<Party> {
  const paths = [];
  if (party.avatar_path) paths.push(party.avatar_path);
  if (party.banner_path) paths.push(party.banner_path);

  if (paths.length === 0) {
    return { ...party, bannerUrl: null, avatarUrl: null };
  }

  try {
    const urlMap = await partiesStorage.getUrls(paths);

    const avatarUrl = party.avatar_path
      ? (urlMap.get(party.avatar_path) ?? null)
      : null;
    const bannerUrl = party.banner_path
      ? (urlMap.get(party.banner_path) ?? null)
      : null;

    if (party.avatar_path && !avatarUrl) {
      logger.warn('Missing resolved avatar URL for party', {
        partyId: party.id,
        avatarPath: party.avatar_path,
      });
    }

    if (party.banner_path && !bannerUrl) {
      logger.warn('Missing resolved banner URL for party', {
        partyId: party.id,
        bannerPath: party.banner_path,
      });
    }

    return { ...party, avatarUrl, bannerUrl };
  } catch (error) {
    logger.error('Error resolving party URLs', {
      partyId: party.id,
      avatarPath: party.avatar_path,
      bannerPath: party.banner_path,
      error,
    });
    return { ...party, avatarUrl: null, bannerUrl: null };
  }
}
