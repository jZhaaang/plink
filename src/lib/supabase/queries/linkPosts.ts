import { supabase } from '../client';
import { logger } from '../logger';
import { LinkPost, LinkPostInsert } from '../../models';

export async function getLinkPostsByLinkId(
  linkId: string,
): Promise<LinkPost[]> {
  const { data, error } = await supabase
    .from('link_posts')
    .select('*')
    .eq('link_id', linkId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching link posts:', error.message);
    throw error;
  }

  return data;
}

export async function getLinkPostById(
  postId: string,
): Promise<LinkPost | null> {
  const { data, error } = await supabase
    .from('link_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    logger.error('Error fetching link post:', error.message);
    throw error;
  }

  return data;
}

export async function createLinkPost(
  post: LinkPostInsert,
): Promise<LinkPost | null> {
  const { data, error } = await supabase
    .from('link_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    logger.error('Error creating link post:', error.message);
    throw error;
  }

  return data;
}

export async function deleteLinkPost(postId: string) {
  const { error } = await supabase.from('link_posts').delete().eq('id', postId);

  if (error) {
    logger.error('Error deleting link post:', error.message);
    throw error;
  }
}
