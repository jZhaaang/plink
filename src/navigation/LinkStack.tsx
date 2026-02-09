import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LinkStackParamList } from './types';
import LinkDetailScreen from '../features/links/screens/LinkDetailScreen';
import MediaViewerScreen from '../features/links/screens/MediaViewerScreen';
import AllMediaScreen from '../features/links/screens/AllMediaScreen';

const Stack = createNativeStackNavigator<LinkStackParamList>();

export default function LinkStack() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
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
