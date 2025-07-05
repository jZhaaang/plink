import { supabase } from '@/lib/supabase/supabase';
import { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }

  return data;
}

export async function upsertUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId } satisfies UserInsert, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error.message);
    return null;
  }

  return data;
}

export async function updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error.message);
    return null;
  }

  return data;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from('users').delete().eq('id', id);

  if (error) {
    console.error('Error deleting user:', error.message);
    return false;
  }

  return true;
}
