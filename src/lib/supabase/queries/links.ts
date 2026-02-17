import { supabase } from '../client';
import { logger } from '../../telemetry/logger';
import { LinkRow, LinkInsert, LinkUpdate } from '../../models';

export async function getLinksByUserId(userId: string): Promise<LinkRow[]> {
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

export async function getLinkById(linkId: string): Promise<LinkRow | null> {
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
): Promise<LinkRow[] | null> {
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

export async function getActiveLinkByUserId(
  userId: string,
): Promise<LinkRow | null> {
  const { data, error } = await supabase
    .from('link_members')
    .select('links!inner (*)')
    .eq('user_id', userId)
    .is('links.end_time', null);

  if (error) {
    logger.error('Error fetching active link:', error.message);
    throw error;
  }

  if (!data || data.length === 0 || !data[0]?.links) return null;
  return data[0].links;
}

export async function createLink(link: LinkInsert): Promise<LinkRow | null> {
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
  linkUpdate: LinkUpdate,
): Promise<LinkRow | null> {
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

export async function endLink(linkId: string): Promise<LinkRow | null> {
  const { data, error } = await supabase
    .from('links')
    .update({ end_time: new Date().toISOString() })
    .eq('id', linkId)
    .select()
    .single();

  if (error) {
    logger.error('Error ending link:', error.message);
    throw error;
  }

  return data;
}

export async function getLinkDetailById(linkId: string) {
  const { data, error } = await supabase
    .from('links')
    .select(
      `*, link_members(user_id, profiles (*)), link_posts(*, link_post_media (*))`,
    )
    .eq('id', linkId)
    .order('created_at', { referencedTable: 'link_posts', ascending: false })
    .single();

  if (error) {
    logger.error('Error fetching link detail:', error.message);
    throw error;
  }

  return data;
}
