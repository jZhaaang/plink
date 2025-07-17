import { LinkPostWithUrls, LinkPostWithUser } from '@/types/models';
import { supabase } from '../queries';

export async function resolveSignedUrlsForPosts(
  posts: LinkPostWithUser[],
): Promise<LinkPostWithUrls[]> {
  const allPaths = posts.flatMap((p) => p.image_paths || []);

  const { data, error } = await supabase.storage
    .from('link-posts')
    .createSignedUrls(allPaths, 60 * 60);

  if (!data || error) {
    console.error(error.message);
    throw error;
  }

  const urls = data.map((item) => item.signedUrl);

  return posts.map((post) => ({
    ...post,
    signed_image_urls: urls,
  }));
}
