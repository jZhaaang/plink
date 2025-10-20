import { supabase } from '../client';
import { logger } from '../logger';
import { Link, LinkInsert } from '../../models';

export async function getLinksByUserId(userId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('link_members')
    .select('links (*)')
    .eq('user_id', userId);

  if (error) {
    logger.error('Error fetching user links:', error.message);
    throw error;
  }

  return data.map((userLinks) => userLinks.links);
}

export async function getLinkById(linkId: string): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', linkId)
    .single();

  if (error) {
    logger.error('Error fetching link:', error.message);
    throw error;
  }

  return data;
}

export async function getLinksByPartyId(
  partyId: string,
): Promise<Link[] | null> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('party_id', partyId);

  if (error) {
    logger.error('Error fetching links:', error.message);
    throw error;
  }

  return data;
}

export async function createLink(link: LinkInsert): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .insert(link)
    .select()
    .single();

  if (error) {
    logger.error('Error creating link:', error.message);
    throw error;
  }

  return data;
}

export async function updateLinkById(
  linkId: string,
  linkUpdate: LinkInsert,
): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .update(linkUpdate)
    .eq('id', linkId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating link:', error.message);
    throw error;
  }

  return data;
}

export async function deleteLink(linkId: string) {
  const { error } = await supabase.from('links').delete().eq('id', linkId);

  if (error) {
    logger.error('Error deleting link:', error.message);
    throw error;
  }
}
