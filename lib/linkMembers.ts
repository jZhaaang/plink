import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type LinkMember = Database['public']['Tables']['link_members']['Row'];
type LinkMemberInsert = Database['public']['Tables']['link_members']['Insert'];

export async function getLinkMembers(linkId: string): Promise<LinkMember[] | null> {
  const { data, error } = await supabase
    .from('link_members')
    .select('*, users(name)')
    .eq('link_id', linkId);

  if (error) {
    console.error('Error fetching link members:', error.message);
    return null;
  }

  return data;
}

export async function addLinkMember(member: LinkMemberInsert): Promise<LinkMember | null> {
  const { data, error } = await supabase.from('link_members').insert(member).select().single();

  if (error) {
    console.error('Error adding link member:', error.message);
    return null;
  }

  return data;
}

export async function removeLinkMember(linkId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('link_members')
    .delete()
    .match({ link_id: linkId, user_id: userId });

  if (error) {
    console.error('Error removing link member:', error.message);
    return false;
  }

  return true;
}
