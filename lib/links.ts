import { Database } from '@/types/supabase';
import { supabase } from './supabase';

type Link = Database['public']['Tables']['links']['Row'];
type Insert = Database['public']['Tables']['links']['Insert'];
type Update = Database['public']['Tables']['links']['Update'];

export async function getLinksByParty(
  partyId: string,
  activeOnly: boolean = false,
): Promise<Link[]> {
  let query = supabase
    .from('links')
    .select('*')
    .eq('party_id', partyId)
    .order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching links:', error.message);
    return [];
  }

  return data;
}

export async function getLinkById(linkId: string): Promise<Link | null> {
  const { data, error } = await supabase.from('links').select('*').eq('id', linkId).single();

  if (error) {
    console.error('Error fetching link:', error.message);
    return null;
  }

  return data;
}

export async function createLink(
  partyId: string,
  name: string,
  createdBy: string,
): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .insert({ party_id: partyId, name, created_by: createdBy, is_active: true } as Insert)
    .select()
    .single();

  if (error) {
    console.error('Error creating link:', error.message);
    return null;
  }

  return data;
}

export async function endLink(linkId: string): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .update({ is_active: false } as Update)
    .eq('id', linkId)
    .select()
    .single();

  if (error) {
    console.error('Error ending link:', error.message);
    return null;
  }

  return data;
}

export async function deleteLink(linkId: string): Promise<boolean> {
  const { error } = await supabase.from('links').delete().eq('id', linkId);

  if (error) {
    console.error('Error deleting link:', error.message);
    return false;
  }

  return true;
}
