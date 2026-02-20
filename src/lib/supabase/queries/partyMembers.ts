import { supabase } from '../client';
import { PartyMemberRow, PartyMemberInsert } from '../../models';

export async function getPartyMembersByPartyId(
  partyId: string,
): Promise<PartyMemberRow[]> {
  const { data, error } = await supabase
    .from('party_members')
    .select('*')
    .eq('party_id', partyId);

  if (error) {
    throw error;
  }

  return data;
}

export async function createPartyMember(
  partyMember: PartyMemberInsert,
): Promise<PartyMemberRow> {
  const { data, error } = await supabase
    .from('party_members')
    .insert(partyMember)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePartyMember(
  partyId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('party_members')
    .delete()
    .match({ party_id: partyId, user_id: userId });

  if (error) throw error;

  return;
}
