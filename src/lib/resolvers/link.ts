import {
  Link,
  LinkMedia,
  LinkMediaRow,
  LinkMediaRowWithProfile,
  LinkPostMedia,
  LinkPostMediaRow,
  LinkRow,
  Profile,
} from '../models';
import { links as linksStorage } from '../media-service/links';
import { logger } from '../telemetry/logger';
import { resolveProfile } from './profile';

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

export async function resolveLinkMedia(
  media: LinkMediaRowWithProfile[],
): Promise<LinkMedia[]> {
  if (media.length === 0) return [];

  const allPaths: string[] = [];
  for (const m of media) {
    allPaths.push(m.path);
    if (m.thumbnail_path) {
      allPaths.push(m.thumbnail_path);
    }
  }

  let mediaMap: Map<string, string>;
  try {
    mediaMap = await linksStorage.getLinkMediaUrls(media[0].link_id, allPaths);
  } catch (err) {
    logger.error('Error resolving link media', { err });
    return [];
  }

  const profilesMap = new Map<string, Profile>();
  await Promise.all(
    media
      .filter((m) => !profilesMap.has(m.owner_id))
      .map(async (m) => {
        const resolved = await resolveProfile(m.profiles);
        profilesMap.set(m.owner_id, resolved);
      }),
  );

  const resolved: LinkMedia[] = [];
  for (const m of media) {
    const owner = profilesMap.get(m.owner_id);
    const url = mediaMap.get(m.path);
    if (!url) {
      logger.warn('Missing resolved media URL for link media', {
        mediaId: m.id,
        mediaPath: m.path,
      });
      continue;
    }

    const thumbnailUrl = m.thumbnail_path
      ? (mediaMap.get(m.thumbnail_path) ?? null)
      : null;
    if (!thumbnailUrl && !!m.thumbnail_path) {
      logger.warn('Missing resolved media URL for link media thumbnail', {
        mediaId: m.id,
        mediaPath: m.path,
      });
    }

    const { profiles: _, ...row } = m;
    resolved.push({ ...row, owner, url, thumbnailUrl });
  }

  return resolved;
}

export async function resolveLinkPostMediaItems(
  linkId: string,
  mediaItems: LinkPostMediaRow[],
): Promise<Map<string, LinkPostMedia>> {
  const allPaths: string[] = [];
  for (const media of mediaItems) {
    allPaths.push(media.path);
    if (media.thumbnail_path) {
      allPaths.push(media.thumbnail_path);
    }
  }

  let urlMap = null;
  try {
    urlMap = await linksStorage.getLinkMediaUrls(linkId, allPaths);
  } catch (err) {
    logger.error('Error resolving link post media items', { err });
    return new Map();
  }

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
    if (!thumbnailUrl && !!media.thumbnail_path) {
      logger.warn('Missing resolved media URL for link media thumbnail', {
        mediaId: media.id,
        mediaPath: media.path,
      });
    }

    resolved.set(media.id, { ...media, url, thumbnailUrl });
  }

  return resolved;
}
