import { Link, LinkPostMedia, LinkPostMediaRow, LinkRow } from '../models';
import { links as linksStorage } from '../supabase/storage/links';
import { logger } from '../telemetry/logger';

export async function resolveLink(link: LinkRow): Promise<Link> {
  if (!link.banner_path) return { ...link, bannerUrl: null };

  try {
    const bannerUrlMap = await linksStorage.getUrls([link.banner_path]);
    const bannerUrl = bannerUrlMap.get(link.banner_path) ?? null;

    if (!bannerUrl) {
      logger.warn('Missing resolved banner URL for link', {
        linkId: link.id,
        bannerPath: link.banner_path,
      });
    }

    return { ...link, bannerUrl };
  } catch (error) {
    logger.error('Failed to resolve link banner URL', {
      linkId: link.id,
      bannerPath: link.banner_path,
      error,
    });
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
    const url = urlMap.get(media.path);
    if (!url) {
      logger.warn('Missing resolved media URL for link media', {
        mediaId: media.id,
        mediaPath: media.path,
      });
      continue;
    }

    resolved.set(media.id, { ...media, url });
  }

  return resolved;
}
