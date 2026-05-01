import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';
import { Party } from './party';
import { Profile, ProfileRow } from './profile';

export type LinkRow = Tables<'links'>;
export type LinkInsert = TablesInsert<'links'>;
export type LinkUpdate = TablesUpdate<'links'>;

export type LinkLocationRow = Tables<'link_locations'>;
export type LinkLocationInsert = TablesInsert<'link_locations'>;
export type LinkLocationUpdate = TablesUpdate<'link_locations'>;

export type LinkMediaRow = Tables<'link_media'>;
export type LinkMediaRowWithProfile = LinkMediaRow & { profiles: ProfileRow };
export type LinkMedia = LinkMediaRow & {
  owner: Profile;
  url: string;
  thumbnailUrl: string | null;
};
export type LinkMediaInsert = TablesInsert<'link_media'>;
export type LinkMediaUpdate = TablesUpdate<'link_media'>;

export type LinkMemberRow = Tables<'link_members'>;
export type LinkMemberInsert = TablesInsert<'link_members'>;
export type LinkMemberUpdate = TablesUpdate<'link_members'>;

export type Link = LinkRow & { bannerUrl?: string };

export type LinkDetail = Link & {
  members: Profile[];
  mediaCount: number;
  locations: LinkLocationRow[];
};

export type HomeFeedLink = LinkDetail & {
  party: Party;
  media: LinkMedia[];
};

export type ActiveFeedLink = LinkDetail & {
  party: Party;
};
