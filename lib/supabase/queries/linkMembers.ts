import { supabase } from '@/lib/supabase/queries/supabase';
import { LinkMember, LinkMemberInsert, LinkMemberWithUser } from '@/types/models';

export async function getLinkMembers(
  linkId: string,
): Promise<{ data: LinkMemberWithUser[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('link_members')
    .select('*, users(*)')
    .eq('link_id', linkId);

  if (error) {
    console.error('Error fetching link members:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function addLinkMember(
  member: LinkMemberInsert,
): Promise<{ data: LinkMember | null; error: Error | null }> {
  const { data, error } = await supabase.from('link_members').insert(member).select().single();

  if (error) {
    console.error('Error adding link member:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function removeLinkMember(
  linkId: string,
  userId: string,
): Promise<{ data: LinkMember | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('link_members')
    .delete()
    .match({ link_id: linkId, user_id: userId });

  if (error) {
    console.error('Error removing link member:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}
