import {
  LinkRow,
  LinkWithMembers,
  LinkPostMedia,
  LinkPostMediaRow,
} from '../models';
import { links as linksStorage } from '../supabase/storage/links';
import { getLinkMembersByLinkId } from '../supabase/queries/linkMembers';
import { getUserProfile } from '../supabase/queries/users';
import { resolveProfile } from './profile';

export async function resolveLinkWithMembers(
  link: LinkRow,
): Promise<LinkWithMembers> {
  const members = await getLinkMembersByLinkId(link.id);
  const profiles = await Promise.all(
    members.map(async (member) => {
      const profile = await getUserProfile(member.user_id);
      return resolveProfile(profile);
    }),
  );

  return {
    ...link,
    members: profiles,
  };
}

export async function resolveLinkPostMedia(
  media: LinkPostMediaRow,
): Promise<LinkPostMedia> {
  const url = await linksStorage.getUrl(media.path);

  return {
    ...media,
    url,
  };
}
