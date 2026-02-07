import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';

export type ProfileRow = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type Profile = ProfileRow & { avatarUrl?: string };
