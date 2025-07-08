import { Link, LinkInsert, LinkUpdate } from '@/types/models';
import { supabase } from './supabase';

export async function getLinksByPartyId(
  partyId: string,
  activeOnly: boolean = false,
): Promise<{ data: Link[] | null; error: Error | null }> {
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
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getLinkById(
  linkId: string,
): Promise<{ data: Link | null; error: Error | null }> {
  const { data, error } = await supabase.from('links').select('*').eq('id', linkId).single();

  if (error) {
    console.error('Error fetching link:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createLink(
  link: LinkInsert,
): Promise<{ data: Link | null; error: Error | null }> {
  const { data, error } = await supabase.from('links').insert(link).select().single();

  if (error) {
    console.error('Error creating link:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateLink(
  linkId: string,
  link: LinkUpdate,
): Promise<{ data: Link | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('links')
    .update(link)
    .eq('id', linkId)
    .select()
    .single();

  if (error) {
    console.error('Error ending link:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteLink(
  linkId: string,
): Promise<{ data: Link | null; error: Error | null }> {
  const { data, error } = await supabase.from('links').delete().eq('id', linkId);

  if (error) {
    console.error('Error deleting link:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}
