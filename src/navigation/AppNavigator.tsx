import { NavigationContainer } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { useAuth } from '../lib/supabase/hooks/useAuth';
import Tabs from './Tabs';
import AuthStack from './AuthStack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, ready } = useAuth();
  if (!ready) return null;

  return (
    <NavigationContainer>
      <RootStack.Navigator
        id={undefined}
        screenOptions={{ headerShown: false, animationTypeForReplace: 'push' }}
      >
        {session ? (
          <RootStack.Screen name="App" component={Tabs} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
