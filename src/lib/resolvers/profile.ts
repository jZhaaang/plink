import { Profile, ProfileRow } from '../models';
import { supabase } from '../supabase/client';

export function resolveProfile(profile: ProfileRow): Profile {
  const avatarUrl = profile.avatar_path
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data
        .publicUrl
    : undefined;
  return { ...profile, avatarUrl };
}
