import { Party, PartyInsert } from '@/types/models';
import { supabase } from './supabase';

export async function getUserParties(
  userId: string,
): Promise<{ data: Party[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('party_members')
    .select('parties (id, name, created_by, created_at)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user parties:', error.message);
    return { data: null, error };
  }

  return { data: data?.map((userParties) => userParties.parties), error: null };
}

export async function getPartyById(
  partyId: string,
): Promise<{ data: Party | null; error: Error | null }> {
  const { data, error } = await supabase.from('parties').select('*').eq('id', partyId).single();

  if (error) {
    console.error('Error fetching party:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createParty(
  party: PartyInsert,
): Promise<{ data: Party | null; error: Error | null }> {
  const { data, error } = await supabase.from('parties').insert(party).select().single();

  if (error) {
    console.error('Error creating party:', error.message);
    return { data: null, error };
  }

  return { data, error };
}

export async function deleteParty(
  partyId: string,
): Promise<{ data: Party | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('parties')
    .delete()
    .eq('id', partyId)
    .select()
    .single();

  if (error) {
    console.error('Error delting party:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}
