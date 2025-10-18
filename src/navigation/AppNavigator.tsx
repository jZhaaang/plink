import { NavigationContainer } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { useAuth } from '../lib/supabase/hooks/useAuth';
import AuthStack from './AuthStack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProfileGate } from '../lib/supabase/hooks/useProfileGate';
import SignedInStack from './SignedInStack';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, ready } = useAuth();
  const gate = useProfileGate(session, ready);

  if (!ready || gate === 'loading') return null;

  return (
    <NavigationContainer>
      <RootStack.Navigator
        id={undefined}
        screenOptions={{ headerShown: false, animationTypeForReplace: 'push' }}
      >
        {gate === 'auth' ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : (
          <RootStack.Screen
            name="SignedIn"
            component={SignedInStack}
            initialParams={{ needsProfile: gate == 'needsProfile' }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
