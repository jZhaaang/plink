import { Tables, TablesInsert, TablesUpdate } from '../supabase/types';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type ProfileResolved = Profile & { avatarUrl?: string };
