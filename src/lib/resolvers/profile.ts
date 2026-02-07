import { Profile, ProfileRow } from '../models';
import { avatars } from '../supabase/storage/avatars';

export async function resolveProfile(profile: ProfileRow): Promise<Profile> {
  return {
    ...profile,
    avatarUrl: await avatars.getUrl(profile.id, profile.avatar_id),
  };
}
