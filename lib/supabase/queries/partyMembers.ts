import { supabase } from '@/lib/supabase/queries/supabase';
import { Database } from '@/types/supabase';

type PartyMember = Database['public']['Tables']['party_members']['Row'];
type PartyMemberWithUser = PartyMember & {
  users: { name: string; avatar_url: string };
};
type PartyMemberInsert = Database['public']['Tables']['party_members']['Insert'];

export async function getPartyMembers(
  partyId: string,
): Promise<{ data: PartyMemberWithUser[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('party_members')
    .select('*, users(name, avatar_url)')
    .eq('party_id', partyId);

  if (error) {
    console.error('Error fetching party members:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function addPartyMember(
  member: PartyMemberInsert,
): Promise<{ data: PartyMember | null; error: Error | null }> {
  const { data, error } = await supabase.from('party_members').insert(member).select().single();

  if (error) {
    console.error('Error adding party member:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function removePartyMember(
  partyId: string,
  userId: string,
): Promise<{ data: PartyMember | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('party_members')
    .delete()
    .match({ party_id: partyId, user_id: userId });

  if (error) {
    console.error('Error removing party member:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}
