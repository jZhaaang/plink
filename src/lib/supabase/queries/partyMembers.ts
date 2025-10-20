import { supabase } from '../client';
import { PartyMember, PartyMemberInsert } from '../../models';
import { logger } from '../logger';

export async function getPartyMembersByPartyId(
  partyId: string,
): Promise<PartyMember[]> {
  const { data, error } = await supabase
    .from('party_members')
    .select('*')
    .eq('party_id', partyId);

  if (error) {
    logger.error('Error fetching party members:', error.message);
    throw error;
  }

  return data;
}

export async function createPartyMember(
  partyMember: PartyMemberInsert,
): Promise<PartyMember | null> {
  const { data, error } = await supabase
    .from('party_members')
    .insert(partyMember)
    .select()
    .single();

  if (error) {
    logger.error('Error creating party member:', error.message);
    throw error;
  }

  return data;
}

export async function deletePartyMember(partyId: string, userId: string) {
  const { error } = await supabase
    .from('party_members')
    .delete()
    .match({ party_id: partyId, user_id: userId });

  if (error) {
    logger.error('Error deleting party member:', error.message);
    throw error;
  }
}
