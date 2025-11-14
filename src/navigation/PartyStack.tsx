import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PartyStackParamList } from './types';
import PartyListScreen from '../features/parties/screens/PartyListScreen';
import PartyDetailScreen from '../features/parties/screens/PartyDetailScreen';

const Stack = createNativeStackNavigator<PartyStackParamList>();

export default function PartyStack() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PartyList" component={PartyListScreen} />
      <Stack.Screen name="PartyDetail" component={PartyDetailScreen} />
    </Stack.Navigator>
  );
}
