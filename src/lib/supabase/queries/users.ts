import { supabase } from '../client';
import { Profile, ProfileUpdate } from '../models';

export async function getUserProfile(
  userId: string,
): Promise<{ data: Profile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single();

  if (!data || error) {
    console.error('Error fetching profile: ', error.message);
  }

  return { data, error };
}

export async function updateUserProfile(
  userId: string,
  profileUpdate: ProfileUpdate,
): Promise<{
  data: Profile | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId)
    .select()
    .single();

  if (!data || error) {
    console.error('Error updating profile: ', error.message);
  }

  return { data, error };
}

export async function deleteUserProfile(userId: string): Promise<Error | null> {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);

  if (error) {
    console.error('Error deleting profile: ', error.message);
  }

  return error;
}
