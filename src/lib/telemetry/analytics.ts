import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(Constants.expoConfig.extra?.posthogAPIKey, {
  host: 'https://us.i.posthog.com',
  enableSessionReplay: true,
  captureAppLifecycleEvents: true,
  sessionReplayConfig: {
    maskAllTextInputs: true,
    maskAllImages: true,
  },
});

type EventName =
  | 'sign_up_completed'
  | 'profile_completed'
  | 'party_created'
  | 'party_updated'
  | 'party_deleted'
  | 'party_joined'
  | 'party_left'
  | 'link_created'
  | 'link_updated'
  | 'link_ended'
  | 'link_deleted'
  | 'link_joined'
  | 'link_left'
  | 'link_post_created'
  | 'link_post_deleted'
  | 'media_uploaded'
  | 'media_deleted'
  | 'media_upload_failed';

export function trackEvent(
  name: EventName,
  properties?: Record<string, string | number | boolean>,
) {
  posthog.capture(name, properties);
}

export function identifyUser(
  userId: string,
  properties?: Record<string, string>,
) {
  posthog.identify(userId, properties);
}

export function resetUser() {
  posthog.reset();
}
