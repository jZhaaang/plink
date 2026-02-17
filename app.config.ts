import type { ExpoConfig } from '@expo/config';

export default {
  name: 'plink',
  slug: 'plink',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    sentryDSN: process.env.SENTRY_DSN ?? '',
    posthogAPIKey: process.env.POSTHOG_API_KEY ?? '',
    eas: {
      projectId: 'adc09ed9-bd33-44d3-bf90-d5ad713f8604',
    },
  },
  android: {
    package: 'com.anonymous.plink',
  },
  plugins: [
    'expo-font',
    'expo-video',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'react-native',
        organization: 'jimmy-ju',
      },
    ],
  ],
} satisfies ExpoConfig;
