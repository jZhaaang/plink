import { supabase } from '../client';
import { LinkMember, LinkMemberInsert } from '../models';
import { logger } from '../logger';

export async function getLinkMembersByLinkId(
  linkId: string,
): Promise<LinkMember[]> {
  const { data, error } = await supabase
    .from('link_members')
    .select('*')
    .eq('link_id', linkId);

  if (error) {
    logger.error('Error fetching link members:', error.message);
    throw error;
  }

  return data;
}

export async function createLinkMember(
  linkMember: LinkMemberInsert,
): Promise<LinkMember | null> {
  const { data, error } = await supabase
    .from('link_members')
    .insert(linkMember)
    .select()
    .single();

  if (error) {
    logger.error('Error creating link member:', error.message);
    throw error;
  }

  return data;
}

export async function deleteLinkMember(linkId: string, userId: string) {
  const { error } = await supabase
    .from('link_members')
    .delete()
    .match({ link_id: linkId, user_id: userId });

  if (error) {
    logger.error('Error deleting link member:', error.message);
    throw error;
  }
}
