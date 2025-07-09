import HomeScreen from '@/screens/home/HomeScreen';
import CreateLinkScreen from '@/screens/link/CreateLinkScreen';
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';
import PartyListScreen from '@/screens/party/PartyListScreen';
import ProfileScreen from '@/screens/settings/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
type TabName = 'Home' | 'Parties' | 'Link' | 'Notifications' | 'Profile';

const icons: Record<TabName, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Parties: 'people-outline',
  Link: 'link-outline',
  Notifications: 'notifications-outline',
  Profile: 'person-outline',
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          return <Ionicons name={icons[route.name as TabName]} size={size} color={color} />;
        },
        headerShown: false,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Parties" component={PartyListScreen} />
      <Tab.Screen name="Link" component={CreateLinkScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
