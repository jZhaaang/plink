import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import HomeScreen from '../features/home/HomeScreen';
import LinkDetailScreen from '../features/links/screens/LinkDetailScreen';
import MediaViewerScreen from '../features/links/screens/MediaViewerScreen';
import AllMediaScreen from '../features/links/screens/AllMediaScreen';
import { TAB_BAR_HEIGHT } from './CustomTabBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
      }}
    >
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="LinkDetail" component={LinkDetailScreen} />
      <Stack.Screen
        name="MediaViewer"
        component={MediaViewerScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="AllMedia"
        component={AllMediaScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
