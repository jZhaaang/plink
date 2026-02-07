import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';
import { Profile } from './profile';

export type LinkRow = Tables<'links'>;
export type LinkInsert = TablesInsert<'links'>;
export type LinkUpdate = TablesUpdate<'links'>;

export type LinkMemberRow = Tables<'link_members'>;
export type LinkMemberInsert = TablesInsert<'link_members'>;
export type LinkMemberUpdate = TablesUpdate<'link_members'>;

export type LinkPostRow = Tables<'link_posts'>;
export type LinkPostInsert = TablesInsert<'link_posts'>;
export type LinkPostUpdate = TablesUpdate<'link_posts'>;

export type LinkPostMediaRow = Tables<'link_post_media'>;
export type LinkPostMedia = LinkPostMediaRow & { url: string };
export type LinkPostMediaInsert = TablesInsert<'link_post_media'>;
export type LinkPostMediaUpdate = TablesUpdate<'link_post_media'>;

// Resolved types for UI consumption
export type LinkWithMembers = LinkRow & {
  members: Profile[];
};

export type LinkPost = LinkPostRow & {
  owner: Profile;
};

export type LinkPostWithMedia = LinkPost & {
  media: LinkPostMedia[];
};

export type LinkDetail = LinkWithMembers & {
  posts: LinkPostWithMedia[];
  postCount: number;
  mediaCount: number;
};
