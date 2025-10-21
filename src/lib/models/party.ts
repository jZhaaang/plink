import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';
import { ProfileResolved } from './profile';

export type Party = Tables<'parties'>;
export type PartyInsert = TablesInsert<'parties'>;
export type PartyUpdate = TablesUpdate<'parties'>;

export type PartyMember = Tables<'party_members'>;
export type PartyMemberInsert = TablesInsert<'party_members'>;
export type PartyMemberUpdate = TablesUpdate<'party_members'>;

export type PartyResolved = Party & { avatarUrl?: string; bannerUrl?: string };
export type PartyWithMembersResolved = PartyResolved & {
  members: ProfileResolved[];
};
