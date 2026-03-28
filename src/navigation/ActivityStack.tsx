import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ActivityStackParamList } from './types';
import { TAB_BAR_HEIGHT } from './CustomTabBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActivityScreen from '../features/activity/screens/ActivityScreen';

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export default function ActivityStack() {
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
      }}
    >
      <Stack.Screen name="Activity" component={ActivityScreen} />
    </Stack.Navigator>
  );
}
