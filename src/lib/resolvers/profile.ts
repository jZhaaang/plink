import { Profile, ProfileRow } from '../models';
import { profiles as profilesStorage } from '../media-service/profiles';
import { logger } from '../telemetry/logger';

export async function resolveProfile(profile: ProfileRow): Promise<Profile> {
  if (!profile.avatar_path) return { ...profile, avatarUrl: undefined };

  try {
    const urlMap = await profilesStorage.getUrls([profile.avatar_path]);
    const avatarUrl = urlMap.get(profile.avatar_path);

    if (!avatarUrl) {
      logger.warn('Missing resolved avatar URL for profile', {
        profileId: profile.id,
        avatarPath: profile.avatar_path,
      });
    }

    return { ...profile, avatarUrl };
  } catch (error) {
    logger.error('Error resolving profile avatar URL', {
      profileId: profile.id,
      avatarPath: profile.avatar_path,
      error,
    });
    return { ...profile, avatarUrl: undefined };
  }
}
