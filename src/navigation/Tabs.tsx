import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabsParamList } from './types';
import HomeScreen from '../features/home/HomeScreen';
import PartyListScreen from '../features/parties/screens/PartyListScreen';

const Tab = createBottomTabNavigator<TabsParamList>();

export default function Tabs() {
  return (
    <Tab.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="PartyList" component={PartyListScreen} />
    </Tab.Navigator>
  );
}
