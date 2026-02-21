import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PartyStackParamList } from './types';
import PartyListScreen from '../features/parties/screens/PartyListScreen';
import PartyDetailScreen from '../features/parties/screens/PartyDetailScreen';
import LinkDetailScreen from '../features/links/screens/LinkDetailScreen';
import MediaViewerScreen from '../features/links/screens/MediaViewerScreen';
import AllMediaScreen from '../features/links/screens/AllMediaScreen';

const Stack = createNativeStackNavigator<PartyStackParamList>();

export default function PartyStack() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PartyList" component={PartyListScreen} />
      <Stack.Screen name="PartyDetail" component={PartyDetailScreen} />
      <Stack.Screen name="LinkDetail" component={LinkDetailScreen} />
      <Stack.Screen
        name="MediaViewer"
        component={MediaViewerScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade_from_bottom',
          gestureEnabled: false,
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
