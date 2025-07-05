import { Database } from '@/types/supabase';
import { supabase } from './supabase';

type Party = Database['public']['Tables']['parties']['Row'];
type PartyInsert = Database['public']['Tables']['parties']['Insert'];

export async function getUserParties(userId: string): Promise<Party[]> {
  const { data, error } = await supabase
    .from('party_members')
    .select('parties (id, name, created_by, created_at)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user parties:', error.message);
    return [];
  }

  return data?.map((userParties) => userParties.parties) ?? [];
}

export async function getPartyById(partyId: string): Promise<Party | null> {
  const { data, error } = await supabase.from('parties').select('*').eq('id', partyId).single();

  if (error) {
    console.error('Error fetching party:', error.message);
    return null;
  }

  return data;
}

export async function createParty(party: PartyInsert): Promise<Party | null> {
  const { data, error } = await supabase.from('parties').insert(party).select().single();

  if (error) {
    console.error('Error creating party:', error.message);
    return null;
  }

  return data;
}

export async function deleteParty(partyId: string): Promise<Party | null> {
  const { data, error } = await supabase
    .from('parties')
    .delete()
    .eq('id', partyId)
    .select()
    .single();

  if (error) {
    console.error('Error delting party:', error.message);
    return null;
  }

  return data;
}
