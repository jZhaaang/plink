import { Database } from './supabase';

// Base row types
export type Party = Database['public']['Tables']['parties']['Row'];
export type Link = Database['public']['Tables']['links']['Row'];
export type LinkMember = Database['public']['Tables']['link_members']['Row'];
export type LinkPost = Database['public']['Tables']['link_posts']['Row'];
export type PartyMember = Database['public']['Tables']['party_members']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

// Insert types
export type PartyInsert = Database['public']['Tables']['parties']['Insert'];
export type LinkInsert = Database['public']['Tables']['links']['Insert'];
export type LinkMemberInsert = Database['public']['Tables']['link_members']['Insert'];
export type LinkPostInsert = Database['public']['Tables']['link_posts']['Insert'];
export type PartyMemberInsert = Database['public']['Tables']['party_members']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];

// Update types
export type PartyUpdate = Database['public']['Tables']['parties']['Update'];
export type LinkUpdate = Database['public']['Tables']['links']['Update'];
export type LinkMemberUpdate = Database['public']['Tables']['link_members']['Update'];
export type LinkPostUpdate = Database['public']['Tables']['link_posts']['Update'];
export type PartyMemberUpdate = Database['public']['Tables']['party_members']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Joined types for UI
export type PartyWithRecentLink = {
  party: Party;
  link: Link | null;
};

export type PartyMemberWithUser = PartyMember & {
  users: { name: string; avatar_url: string };
};

export type LinkMemberWithUser = LinkMember & {
  users: { name: string; avatar_url: string };
};

export type LinkPostWithUser = LinkPost & {
  users: { name: string; avatar_url: string };
};
