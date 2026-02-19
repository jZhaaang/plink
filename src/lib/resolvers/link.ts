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
    logger.error('Error resolving link banner URL', {
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
  const allPaths: string[] = [];
  for (const media of mediaItems) {
    allPaths.push(media.path);
    if (media.thumbnail_path) {
      allPaths.push(media.thumbnail_path);
    }
  }
  const urlMap = await linksStorage.getUrls(allPaths);

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

    const thumbnailUrl = media.thumbnail_path
      ? (urlMap.get(media.thumbnail_path) ?? null)
      : null;
    if (!thumbnailUrl) {
      logger.warn('Missing resolved media URL for link media thumbnail', {
        mediaId: media.id,
        mediaPath: media.path,
      });
    }

    resolved.set(media.id, { ...media, url, thumbnailUrl });
  }

  return resolved;
}
