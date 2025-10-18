import type { Tables, TablesInsert, TablesUpdate } from './types';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type Party = Tables<'parties'>;
export type PartyInsert = TablesInsert<'parties'>;
export type PartyUpdate = TablesUpdate<'parties'>;

export type PartyMember = Tables<'party_members'>;
export type PartyMemberInsert = TablesInsert<'party_members'>;
export type PartyMemberUpdate = TablesUpdate<'party_members'>;

export type Link = Tables<'links'>;
export type LinkInsert = TablesInsert<'links'>;
export type LinkUpdate = TablesUpdate<'links'>;

export type LinkMember = Tables<'link_members'>;
export type LinkMemberInsert = TablesInsert<'link_members'>;
export type LinkMemberUpdate = TablesUpdate<'link_members'>;

export type LinkPost = Tables<'link_posts'>;
export type LinkPostInsert = TablesInsert<'link_posts'>;
export type LinkPostUpdate = TablesUpdate<'link_posts'>;

export type LinkPostMedia = Tables<'link_post_media'>;
export type LinkPostMediaInsert = TablesInsert<'link_post_media'>;
export type LinkPostMediaUpdate = TablesUpdate<'link_post_media'>;
