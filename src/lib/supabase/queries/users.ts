import { supabase } from '../client';
import { ProfileRow, ProfileUpdate } from '../../models';
import { normalize } from '../../utils/validation';

export async function getUserProfile(userId: string): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single();

  if (error) throw error;

  return data;
}

export async function updateUserProfile(
  userId: string,
  profileUpdate: ProfileUpdate,
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);

  if (error) throw error;

  return;
}

export async function searchUserByUsername(
  username: string,
): Promise<ProfileRow | null> {
  const normalizedUsername = normalize(username).replace(/^@/, '');
  if (!normalizedUsername) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('username', normalizedUsername)
    .single();

  if (error) {
    if (error && error.code !== 'PGRST116') throw error;
    return null;
  }

  return data;
}
