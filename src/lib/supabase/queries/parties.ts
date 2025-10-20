import { supabase } from '../client';
import { logger } from '../logger';
import { Party, PartyInsert } from '../models';

export async function getPartiesByUserId(userId: string): Promise<Party[]> {
  const { data, error } = await supabase
    .from('party_members')
    .select('parties (*)')
    .eq('user_id', userId);

  if (error) {
    logger.error('Error fetching user parties:', error.message);
    throw error;
  }

  return data.map((userParties) => userParties.parties);
}

export async function getPartyById(partyId: string): Promise<Party | null> {
  const { data, error } = await supabase
    .from('parties')
    .select('*')
    .eq('id', partyId)
    .single();

  if (error) {
    logger.error('Error fetching party:', error.message);
    throw error;
  }

  return data;
}

export async function createParty(party: PartyInsert): Promise<Party | null> {
  const { data, error } = await supabase
    .from('parties')
    .insert(party)
    .select()
    .single();

  if (error) {
    logger.error('Error creating party:', error.message);
    throw error;
  }

  return data;
}

export async function updatePartyById(
  partyId: string,
  partyUpdate: PartyInsert,
): Promise<Party | null> {
  const { data, error } = await supabase
    .from('parties')
    .update(partyUpdate)
    .eq('id', partyId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating party:', error.message);
    throw error;
  }

  return data;
}

export async function deleteParty(partyId: string) {
  const { error } = await supabase.from('parties').delete().eq('id', partyId);

  if (error) {
    logger.error('Error deleting party:', error.message);
    throw error;
  }
}
