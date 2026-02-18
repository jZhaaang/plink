import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, SignedInParamList } from './types';
import Tabs from './Tabs';
import CompleteProfileScreen from '../features/auth/screens/CompleteProfileScreen';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ActiveLinkProvider } from '../providers/ActiveLinkProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { useAuth } from '../providers/AuthProvider';
import { usePushNotifications } from '../features/activity/hooks/usePushNotifications';

const Stack = createNativeStackNavigator<SignedInParamList>();
type SignedInRoute = RouteProp<RootStackParamList, 'SignedIn'>;

function PushNotificationsBootstrap() {
  const { userId } = useAuth();
  usePushNotifications(userId);
  return null;
}

export default function SignedInStack() {
  const route = useRoute<SignedInRoute>();
  const { needsProfile } = route.params;
  return (
    <QueryProvider>
      <ActiveLinkProvider>
        <PushNotificationsBootstrap />
        <Stack.Navigator
          id={undefined}
          screenOptions={{ headerShown: false }}
          initialRouteName={needsProfile ? 'CompleteProfile' : 'App'}
        >
          <Stack.Screen name="App" component={Tabs} />
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
          />
        </Stack.Navigator>
      </ActiveLinkProvider>
    </QueryProvider>
  );
}
