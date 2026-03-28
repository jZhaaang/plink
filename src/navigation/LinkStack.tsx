import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LinkStackParamList } from './types';
import LinkDetailScreen from '../features/links/screens/LinkDetailScreen';
import { TAB_BAR_HEIGHT } from './CustomTabBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator<LinkStackParamList>();

export default function LinkStack() {
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
      }}
    >
      <Stack.Screen name="LinkDetail" component={LinkDetailScreen} />
    </Stack.Navigator>
  );
}
