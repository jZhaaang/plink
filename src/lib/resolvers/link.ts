import { Link, LinkPostMedia, LinkPostMediaRow, LinkRow } from '../models';
import { links as linksStorage } from '../supabase/storage/links';

export async function resolveLink(link: LinkRow): Promise<Link> {
  if (!link.banner_path) return { ...link, bannerUrl: null };

  try {
    const bannerUrlMap = await linksStorage.getUrls([link.banner_path]);
    return { ...link, bannerUrl: bannerUrlMap.get(link.banner_path) ?? null };
  } catch (err) {
    console.warn('[resolveLink] banner url failed', link.id, err);
    return { ...link, bannerUrl: null };
  }
}

export async function resolveLinkPostMediaItems(
  mediaItems: LinkPostMediaRow[],
): Promise<Map<string, LinkPostMedia>> {
  const paths = mediaItems.map((media) => media.path);
  const urlMap = await linksStorage.getUrls(paths);

  const resolved = new Map<string, LinkPostMedia>();
  for (const media of mediaItems) {
    resolved.set(media.id, { ...media, url: urlMap.get(media.path)! });
  }

  return resolved;
}
