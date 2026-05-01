import {
  Link,
  LinkMedia,
  LinkMediaRowWithProfile,
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
