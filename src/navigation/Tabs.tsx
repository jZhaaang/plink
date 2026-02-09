import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { TabsParamList } from './types';
import HomeScreen from '../features/home/HomeScreen';
import PartyStack from './PartyStack';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import CustomTabBar from './CustomTabBar';
import CreateLinkFlowScreen from '../features/links/screens/CreateLinkFlowScreen';
import LinkStack from './LinkStack';

const Tab = createBottomTabNavigator<TabsParamList>();

export default function Tabs() {
  return (
    <>
      <Tab.Navigator
        id={undefined}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            borderTopColor: '#e2e8f0',
            borderTopWidth: 1,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              ></Ionicons>
            ),
          }}
        />
        <Tab.Screen
          name="Party"
          component={PartyStack}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={size}
                color={color}
              ></Ionicons>
            ),
          }}
        />
        <Tab.Screen name="Link" component={LinkStack} listeners={{ tabPress: () => {} }} />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={color}
              ></Ionicons>
            ),
          }}
        />
      </Tab.Navigator>
      <CreateLinkFlowScreen />
    </>
  );
}
