import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
