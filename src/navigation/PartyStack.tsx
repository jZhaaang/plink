import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PartyStackParamList } from './types';
import PartyListScreen from '../features/parties/screens/PartyListScreen';
import PartyDetailScreen from '../features/parties/screens/PartyDetailScreen';
import LinkDetailScreen from '../features/links/screens/LinkDetailScreen';
import { TAB_BAR_HEIGHT } from './CustomTabBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator<PartyStackParamList>();

export default function PartyStack() {
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
      }}
    >
      <Stack.Screen name="PartyList" component={PartyListScreen} />
      <Stack.Screen name="PartyDetail" component={PartyDetailScreen} />
      <Stack.Screen name="LinkDetail" component={LinkDetailScreen} />
    </Stack.Navigator>
  );
}
