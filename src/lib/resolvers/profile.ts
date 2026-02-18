import { Profile, ProfileRow } from '../models';
import { avatars as avatarsStorage } from '../supabase/storage/avatars';
export async function resolveProfile(profile: ProfileRow): Promise<Profile> {
  if (!profile.avatar_path) return { ...profile, avatarUrl: undefined };

  const urlMap = await avatarsStorage.getUrls([profile.avatar_path]);

  return { ...profile, avatarUrl: urlMap.get(profile.avatar_path) };
}
