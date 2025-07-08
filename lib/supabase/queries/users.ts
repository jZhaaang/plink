import { supabase } from '@/lib/supabase/queries/supabase';
import { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export async function getUserById(id: string): Promise<{ data: User | null; error: Error | null }> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching user:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getUserByEmail(
  email: string,
): Promise<{ data: User | null; error: Error | null }> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

  if (error) {
    console.error('Error fetching user:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function upsertUser(
  user: UserInsert,
): Promise<{ data: User | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateUser(
  userId: string,
  updates: UserUpdate,
): Promise<{ data: User | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteUser(id: string): Promise<{ data: User | null; error: Error | null }> {
  const { data, error } = await supabase.from('users').delete().eq('id', id);

  if (error) {
    console.error('Error deleting user:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}
