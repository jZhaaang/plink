import { supabase } from '@/lib/supabase/supabase';
import { Database } from '@/types/supabase';

type LinkPost = Database['public']['Tables']['link_posts']['Row'];
type LinkPostInsert = Database['public']['Tables']['link_posts']['Insert'];

export async function getLinkPosts(linkId: string): Promise<LinkPost[] | null> {
  const { data, error } = await supabase
    .from('link_posts')
    .select('*, users(name)')
    .eq('link_id', linkId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching link posts:', error.message);
    return null;
  }

  return data;
}

export async function createLinkPost(post: LinkPostInsert): Promise<LinkPost | null> {
  const { data, error } = await supabase
    .from('link_posts')
    .insert(post)
    .select('*, users(name)')
    .single();

  if (error) {
    console.error('Error creating post:', error.message);
    return null;
  }

  return data;
}
