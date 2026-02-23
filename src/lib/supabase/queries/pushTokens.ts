import { Platform } from 'react-native';
import { supabase } from '../client';

export async function upsertPushToken(
  userId: string,
  token: string,
): Promise<void> {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform,
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' },
  );

  if (error) throw error;

  return;
}

export async function deletePushToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', token);

  if (error) throw error;

  return;
}
