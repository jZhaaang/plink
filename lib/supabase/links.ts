import { Database } from '@/types/supabase';
import { supabase } from './supabase';

type Link = Database['public']['Tables']['links']['Row'];
type LinkInsert = Database['public']['Tables']['links']['Insert'];
type LinkUpdate = Database['public']['Tables']['links']['Update'];

export async function getLinksByPartyId(
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

export async function createLink(link: LinkInsert): Promise<Link | null> {
  const { data, error } = await supabase.from('links').insert(link).select().single();

  if (error) {
    console.error('Error creating link:', error.message);
    return null;
  }

  return data;
}

export async function endLink(linkId: string, link: LinkUpdate): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .update(link)
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
