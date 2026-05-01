import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function updateThumbnailPath(
  storagePath: string,
  thumbPath: string,
) {
  const { error } = await supabase
    .from('link_media')
    .update({ thumbnail_path: thumbPath })
    .eq('path', storagePath);

  if (error) throw error;
}

export async function getLinkBannerPath(
  linkId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('links')
    .select('banner_path')
    .eq('id', linkId)
    .single();

  return data?.banner_path ?? null;
}

export async function setLinkBanner(linkId: string, bannerPath: string) {
  const { error } = await supabase
    .from('links')
    .update({ banner_path: bannerPath, banner_crop_x: 50, banner_crop_y: 42 })
    .eq('id', linkId)
    .is('banner_path', null);

  if (error) throw error;
}
