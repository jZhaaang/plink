import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PartyStackParamList } from './types';
import PartyListScreen from '../features/parties/screens/PartyListScreen';
import PartyDetailScreen from '../features/parties/screens/PartyDetailScreen';
import LinkDetailScreen from '../features/links/screens/LinkDetailScreen';
import MediaViewerScreen from '../features/links/screens/MediaViewerScreen';

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
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}
