import { supabase } from '../client';
import { LinkMemberRow, LinkMemberInsert } from '../../models';

export async function getLinkMembersByLinkId(
  linkId: string,
): Promise<LinkMemberRow[]> {
  const { data, error } = await supabase
    .from('link_members')
    .select('*')
    .eq('link_id', linkId);

  if (error) throw error;

  return data;
}

export async function createLinkMember(
  linkMember: LinkMemberInsert,
): Promise<LinkMemberRow> {
  const { data, error } = await supabase
    .from('link_members')
    .insert(linkMember)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteLinkMember(
  linkId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('link_members')
    .delete()
    .match({ link_id: linkId, user_id: userId });

  if (error) throw error;

  return;
}
