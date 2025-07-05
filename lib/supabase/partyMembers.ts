import { supabase } from '@/lib/supabase/supabase';
import { Database } from '@/types/supabase';

type PartyMember = Database['public']['Tables']['party_members']['Row'];
type PartyMemberWithUser = PartyMember & {
  users: { name: string | null };
};
type PartyMemberInsert = Database['public']['Tables']['party_members']['Insert'];

export async function getPartyMembers(partyId: string): Promise<PartyMemberWithUser[] | null> {
  const { data, error } = await supabase
    .from('party_members')
    .select('*, users(name)')
    .eq('party_id', partyId);

  if (error) {
    console.error('Error fetching party members:', error.message);
    return null;
  }

  return data;
}

export async function addPartyMember(member: PartyMemberInsert): Promise<PartyMember | null> {
  const { data, error } = await supabase.from('party_members').insert(member).select().single();

  if (error) {
    console.error('Error adding party member:', error.message);
    return null;
  }

  return data;
}

export async function removePartyMember(partyId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('party_members')
    .delete()
    .match({ party_id: partyId, user_id: userId });

  if (error) {
    console.error('Error removing party member:', error.message);
    return false;
  }

  return true;
}
