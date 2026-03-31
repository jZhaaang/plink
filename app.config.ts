import type { ExpoConfig } from '@expo/config';

export default {
  name: 'plink',
  slug: 'plink',
  scheme: 'plink',
  version: '1.1.1',
  extra: {
    sentryDSN: process.env.SENTRY_DSN ?? '',
    posthogAPIKey: process.env.POSTHOG_API_KEY ?? '',
    eas: {
      projectId: 'adc09ed9-bd33-44d3-bf90-d5ad713f8604',
    },
  },
  android: {
    package: 'com.anonymous.plink',
    googleServicesFile: './google-services.json',
    permissions: ['android.permission.ACCESS_COARSE_LOCATION'],
  },
  ios: {
    bundleIdentifier: 'com.jimmy.plink',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription: 'Used to find places near you',
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
