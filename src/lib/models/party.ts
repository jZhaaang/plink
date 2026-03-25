import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';
import { Link } from './link';
import { Profile } from './profile';

export type PartyRow = Tables<'parties'>;
export type PartyInsert = TablesInsert<'parties'>;
export type PartyUpdate = TablesUpdate<'parties'>;

export type PartyMemberRow = Tables<'party_members'>;
export type PartyMemberInsert = TablesInsert<'party_members'>;
export type PartyMemberUpdate = TablesUpdate<'party_members'>;

export type Party = PartyRow & {
  avatarUrl?: string;
  bannerUrl?: string;
};
export type PartyDetail = Party & {
  members: Profile[];
  activeLink: Link | null;
  linkCount: number;
};
export type PartyListItem = Party & {
  members: Profile[];
};
