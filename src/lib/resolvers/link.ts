import { LinkPostMedia, LinkPostMediaRow } from '../models';
import { links as linksStorage } from '../supabase/storage/links';

export async function resolveLinkPostMedia(
  media: LinkPostMediaRow,
): Promise<LinkPostMedia> {
  const url = await linksStorage.getUrl(media.path);

  return {
    ...media,
    url,
  };
}
