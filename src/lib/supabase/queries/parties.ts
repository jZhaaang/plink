import { supabase } from '../client';
import { PartyRow, PartyInsert, PartyUpdate } from '../../models';

export async function getPartiesByUserId(userId: string): Promise<PartyRow[]> {
  const { data, error } = await supabase
    .from('party_members')
    .select('parties (*)')
    .eq('user_id', userId);

  if (error) throw error;

  return data.map((userParties) => userParties.parties);
}

export async function getPartyById(partyId: string): Promise<PartyRow> {
  const { data, error } = await supabase
    .from('parties')
    .select('*')
    .eq('id', partyId)
    .single();

  if (error) throw error;

  return data;
}

export async function createParty(party: PartyInsert): Promise<PartyRow> {
  const { data, error } = await supabase
    .from('parties')
    .insert(party)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updatePartyById(
  partyId: string,
  partyUpdate: PartyUpdate,
): Promise<PartyRow> {
  const { data, error } = await supabase
    .from('parties')
    .update(partyUpdate)
    .eq('id', partyId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteParty(partyId: string): Promise<void> {
  const { error } = await supabase.from('parties').delete().eq('id', partyId);

  if (error) throw error;

  return;
}

export async function getPartiesWithMembersByUserId(userId: string) {
  const { data, error } = await supabase
    .from('party_members')
    .select('parties (*, party_members (user_id, profiles(*)))')
    .eq('user_id', userId);

  if (error) throw error;

  return data.map((d) => d.parties);
}

export async function getPartiesWithMembersAndLinksByUserId(userId: string) {
  const { data, error } = await supabase
    .from('party_members')
    .select(`parties (*, party_members (user_id, profiles (*)), links (*))`)

    .eq('user_id', userId);

  if (error) throw error;

  return data.map((d) => d.parties);
}

export async function getPartyDetailById(partyId: string) {
  const { data, error } = await supabase
    .from('parties')
    .select(`*,party_members (user_id,profiles (*)),links (*)`)
    .eq('id', partyId)
    .single();

  if (error) throw error;

  return data;
}
