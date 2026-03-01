import type { ExpoConfig } from '@expo/config';

export default {
  name: 'plink',
  slug: 'plink',
  scheme: 'plink',
  version: '1.1.1',
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
    versionCode: 3,
    googleServicesFile: './google-services.json',
  },
  ios: {
    bundleIdentifier: 'com.jimmy.plink',
    buildNumber: '3',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  plugins: [
    'expo-font',
    'expo-video',
    'expo-notifications',
    'react-native-edge-to-edge',
    [
      'react-native-vision-camera',
      {
        cameraPermissionText: 'Allow plink to access your camera',
        enableMicrophonePermission: true,
        microphonePermissionText: 'Allow plink to access your microphone',
      },
    ],
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
