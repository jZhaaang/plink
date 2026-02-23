import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { upsertPushToken } from '../../../lib/supabase/queries/pushTokens';
import { useEffect } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SignedInParamList } from '../../../navigation/types';
import { logger } from '../../../lib/telemetry/logger';

type PushData = {
  type?: string;
  eventId?: string;
  partyId?: string | null;
  linkId?: string | null;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushToken(userId: string): Promise<void> {
  if (!Device.isDevice) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;
  if (status !== 'granted') {
    const ask = await Notifications.requestPermissionsAsync();
    status = ask.status;
  }
  if (status !== 'granted') return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    await upsertPushToken(userId, token);
  } catch (err) {
    logger.error('Push registration failed', {
      error: err instanceof Error ? err : new Error(String(err)),
      platform: Platform.OS,
      projectId,
    });
  }
}

function extractData(
  response: Notifications.NotificationResponse,
): PushData | null {
  const raw = response.notification.request.content.data;
  if (!raw || typeof raw !== 'object') return null;
  return raw as PushData;
}

function navigateFromPushData(
  navigation: NavigationProp<SignedInParamList>,
  data: PushData | null,
): void {
  if (!data) return;
  if (data.type !== 'activity_event') return;

  if (data.linkId && data.partyId) {
    navigation.navigate('App', {
      screen: 'Link',
      params: {
        screen: 'LinkDetail',
        params: { linkId: data.linkId, partyId: data.partyId },
      },
    });
    return;
  }

  if (data.partyId) {
    navigation.navigate('App', {
      screen: 'Party',
      params: {
        screen: 'PartyDetail',
        params: { partyId: data.partyId },
      },
    });
  }
}

export function usePushNotifications(userId: string | null) {
  const navigation = useNavigation<NavigationProp<SignedInParamList>>();

  useEffect(() => {
    if (!userId) return;
    void registerForPushToken(userId);
  }, [userId]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = extractData(response);
        navigateFromPushData(navigation, data);
      },
    );

    const response = Notifications.getLastNotificationResponse();
    if (response) {
      const data = extractData(response);
      navigateFromPushData(navigation, data);
      Notifications.clearLastNotificationResponse();
    }

    return () => sub.remove();
  }, [navigation]);
}
