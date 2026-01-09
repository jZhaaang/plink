import {
  Link,
  LinkWithMembersResolved,
  LinkPostMedia,
  LinkPostMediaResolved,
} from '../models';
import { links as linksStorage } from '../supabase/storage/links';
import { getLinkMembersByLinkId } from '../supabase/queries/linkMembers';
import { getUserProfile } from '../supabase/queries/users';
import { toProfileResolved } from './profile';

export async function toLinkWithMembersResolved(
  link: Link,
): Promise<LinkWithMembersResolved> {
  const members = await getLinkMembersByLinkId(link.id);
  const profiles = await Promise.all(
    members.map(async (member) => {
      const profile = await getUserProfile(member.user_id);
      return toProfileResolved(profile);
    }),
  );

  return {
    ...link,
    members: profiles,
  };
}

export async function toLinkPostMediaResolved(
  media: LinkPostMedia,
): Promise<LinkPostMediaResolved> {
  const url = await linksStorage.getUrl(media.path);

  return {
    ...media,
    url,
  };
}
