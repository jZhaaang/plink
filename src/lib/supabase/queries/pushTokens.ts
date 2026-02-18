import { Platform } from 'react-native';
import { supabase } from '../client';

export async function upsertPushToken(userId: string, token: string) {
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
}
