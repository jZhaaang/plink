import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';

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
export type LinkPostMediaResolved = LinkPostMedia & { url: string };
export type LinkPostMediaInsert = TablesInsert<'link_post_media'>;
export type LinkPostMediaUpdate = TablesUpdate<'link_post_media'>;
