import { Profile, ProfileResolved } from '../models';
import { avatars } from '../supabase/storage/avatars';

export async function toProfileResolved(
  profile: Profile,
): Promise<ProfileResolved> {
  return {
    ...profile,
    avatarUrl: await avatars.getUrl(profile.id, profile.avatar_id),
  };
}
