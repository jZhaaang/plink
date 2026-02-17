import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

export function initMonitoring() {
  Sentry.init({
    dsn: Constants.expoConfig.extra?.sentryDSN,
    debug: __DEV__,
    enabled: !__DEV__,
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // area to clean data
      return event;
    },
  });
}

export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  Sentry.captureException(error, { extra: context });
}

export function setUser(userId: string, username?: string) {
  Sentry.setUser({ id: userId, username });
}

export function clearUser() {
  Sentry.setUser(null);
}

export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    category: 'app',
    message,
    data,
    level: 'info',
  });
}
