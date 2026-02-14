import type { ExpoConfig } from '@expo/config';

export default {
  name: 'plink',
  slug: 'plink',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  android: {
    package: 'com.anonymous.plink',
  },
} satisfies ExpoConfig;
