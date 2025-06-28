import Constants from 'expo-constants';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables.');
}

export { SUPABASE_ANON_KEY, SUPABASE_URL };
