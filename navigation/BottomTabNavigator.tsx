import HomeScreen from '@/screens/home/HomeScreen';
import CreateLinkScreen from '@/screens/link/CreateLinkScreen';
import ProfileScreen from '@/screens/settings/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
type TabName = 'Home' | 'Link' | 'Profile';

const icons: Record<TabName, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Link: 'link-outline',
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
      <Tab.Screen name="Link" component={CreateLinkScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
