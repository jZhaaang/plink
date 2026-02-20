import { supabase } from '../client';
import { LinkPostMediaRow, LinkPostMediaInsert } from '../../models';

export async function getMediaByPostId(
  postId: string,
): Promise<LinkPostMediaRow[]> {
  const { data, error } = await supabase
    .from('link_post_media')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data;
}

export async function getMediaByLinkId(
  linkId: string,
): Promise<LinkPostMediaRow[]> {
  const { data, error } = await supabase
    .from('link_post_media')
    .select('*, link_posts!inner(link_id)')
    .eq('link_posts.link_id', linkId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

export async function createLinkPostMedia(
  media: LinkPostMediaInsert,
): Promise<LinkPostMediaRow> {
  const { data, error } = await supabase
    .from('link_post_media')
    .insert(media)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteLinkPostMedia(mediaId: string): Promise<void> {
  const { error } = await supabase
    .from('link_post_media')
    .delete()
    .eq('id', mediaId);

  if (error) throw error;

  return;
}
