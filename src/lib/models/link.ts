import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';
import { Party } from './party';
import { Profile } from './profile';

export type LinkRow = Tables<'links'>;
export type LinkInsert = TablesInsert<'links'>;
export type LinkUpdate = TablesUpdate<'links'>;

export type LinkLocationRow = Tables<'link_locations'>;
export type LinkLocationInsert = TablesInsert<'link_locations'>;
export type LinkLocationUpdate = TablesUpdate<'link_locations'>;

export type LinkMemberRow = Tables<'link_members'>;
export type LinkMemberInsert = TablesInsert<'link_members'>;
export type LinkMemberUpdate = TablesUpdate<'link_members'>;

export type LinkPostRow = Tables<'link_posts'>;
export type LinkPostInsert = TablesInsert<'link_posts'>;
export type LinkPostUpdate = TablesUpdate<'link_posts'>;

export type LinkPostMediaRow = Tables<'link_post_media'>;
export type LinkPostMedia = LinkPostMediaRow & {
  url: string;
  thumbnailUrl: string | null;
};
export type LinkPostMediaInsert = TablesInsert<'link_post_media'>;
export type LinkPostMediaUpdate = TablesUpdate<'link_post_media'>;

export type Link = LinkRow & { bannerUrl?: string };

export type LinkPost = LinkPostRow & {
  owner: Profile;
};

export type LinkPostWithMedia = LinkPost & {
  media: LinkPostMedia[];
};

export type LinkDetail = Link & {
  members: Profile[];
  postCount: number;
  mediaCount: number;
  locations: LinkLocationRow[];
};

export type HomeFeedLink = LinkDetail & {
  party: Party;
  media: LinkPostMedia[];
};

export type ActiveFeedLink = LinkDetail & {
  party: Party;
};
