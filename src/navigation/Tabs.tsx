import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabsParamList } from './types';
import HomeScreen from '../features/home/HomeScreen';

const Tab = createBottomTabNavigator<TabsParamList>();

export default function Tabs() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{ headerTitleAlign: 'center' }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}
