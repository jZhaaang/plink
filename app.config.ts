import type { ExpoConfig } from '@expo/config';

export default {
  name: 'plink',
  slug: 'plink',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    eas: {
      projectId: 'adc09ed9-bd33-44d3-bf90-d5ad713f8604',
    },
  },
  android: {
    package: 'com.anonymous.plink',
  },
} satisfies ExpoConfig;
