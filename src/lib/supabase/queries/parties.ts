import { supabase } from '../client';
import { PartyRow, PartyInsert, PartyUpdate } from '../../models';
import { LINK_DETAIL_SELECT } from './links';

const PARTY_DETAIL_SELECT = `*,
  party_members (user_id, profiles (*)),
  link_count: links (count),
  active_link: links (${LINK_DETAIL_SELECT})` as const;

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

export async function getPartyDetailById(partyId: string) {
  const { data, error } = await supabase
    .from('parties')
    .select(PARTY_DETAIL_SELECT)
    .eq('id', partyId)
    .is('active_link.end_time', null)
    .single();

  if (error) throw error;

  return data;
}

export async function getPartyDetailsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('party_members')
    .select(`parties (${PARTY_DETAIL_SELECT})`)
    .eq('user_id', userId)
    .is('parties.active_link.end_time', null);

  if (error) throw error;

  return data.map((d) => d.parties);
}
