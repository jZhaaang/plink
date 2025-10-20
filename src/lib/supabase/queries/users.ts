import { supabase } from '../client';
import { logger } from '../logger';
import { Profile, ProfileUpdate } from '../../models';

export async function getUserProfile(userId: string): Promise<Profile | null> {
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
): Promise<Profile | null> {
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
