import { supabase } from '../client';
import { LinkPostRow, LinkPostInsert } from '../../models';

export async function getLinkPostsByLinkId(
  linkId: string,
): Promise<LinkPostRow[]> {
  const { data, error } = await supabase
    .from('link_posts')
    .select('*')
    .eq('link_id', linkId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

export async function getLinkPostById(postId: string): Promise<LinkPostRow> {
  const { data, error } = await supabase
    .from('link_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) throw error;

  return data;
}

export async function createLinkPost(
  post: LinkPostInsert,
): Promise<LinkPostRow> {
  const { data, error } = await supabase
    .from('link_posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteLinkPost(postId: string): Promise<void> {
  const { error } = await supabase.from('link_posts').delete().eq('id', postId);

  if (error) throw error;

  return;
}
