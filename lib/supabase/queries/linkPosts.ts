import { supabase } from '@/lib/supabase/queries/supabase';
import { LinkPost, LinkPostInsert, LinkPostUpdate, LinkPostWithUser } from '@/types/models';

export async function getLinkPosts(
  linkId: string,
): Promise<{ data: LinkPostWithUser[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('link_posts')
    .select('*, users(*)')
    .eq('link_id', linkId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching link posts:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createLinkPost(
  post: LinkPostInsert,
): Promise<{ data: LinkPostWithUser | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('link_posts')
    .insert(post)
    .select('*, users(*)')
    .single();

  if (error) {
    console.error('Error creating post:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateLinkPost(
  postId: string,
  updates: LinkPostUpdate,
): Promise<{ data: LinkPost | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('link_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteLinkPost(
  postId: string,
): Promise<{ data: LinkPost | null; error: Error | null }> {
  const { data, error } = await supabase.from('link_posts').delete().match({ id: postId });

  if (error) {
    console.error('Error deleting post:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}
