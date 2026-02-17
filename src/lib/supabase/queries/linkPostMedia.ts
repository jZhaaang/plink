import { supabase } from '../client';
import { logger } from '../../telemetry/logger';
import { LinkPostMediaRow, LinkPostMediaInsert } from '../../models';

export async function getMediaByPostId(
  postId: string,
): Promise<LinkPostMediaRow[]> {
  const { data, error } = await supabase
    .from('link_post_media')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('Error fetching post media:', error.message);
    throw error;
  }

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

  if (error) {
    logger.error('Error fetching link media:', error.message);
    throw error;
  }

  return data;
}

export async function createLinkPostMedia(
  media: LinkPostMediaInsert,
): Promise<LinkPostMediaRow | null> {
  const { data, error } = await supabase
    .from('link_post_media')
    .insert(media)
    .select()
    .single();

  if (error) {
    logger.error('Error creating link post media:', error.message);
    throw error;
  }

  return data;
}

export async function deleteLinkPostMedia(mediaId: string) {
  const { error } = await supabase
    .from('link_post_media')
    .delete()
    .eq('id', mediaId);

  if (error) {
    logger.error('Error deleting link post media:', error.message);
    throw error;
  }
}
