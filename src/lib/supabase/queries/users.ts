import { supabase } from '../client';
import { logger } from '../../telemetry/logger';
import { ProfileRow, ProfileUpdate } from '../../models';

export async function getUserProfile(
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single();

  if (error) {
    logger.error('Error getting user profile:', error.message);
    throw error;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  profileUpdate: ProfileUpdate,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating user profile:', error.message);
    throw error;
  }

  return data;
}

export async function deleteUserProfile(userId: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);

  if (error) {
    logger.error('Error deleting user profile:', error.message);
    throw error;
  }
}

export async function searchUserByUsername(
  username: string,
): Promise<ProfileRow | null> {
  const normalizedUsername = username.toLowerCase().trim().replace(/^@/, '');

  if (!normalizedUsername) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('username', normalizedUsername)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      logger.error('Error searching user by username:', error.message);
    }
    return null;
  }

  return data;
}
