import { NavigationContainer } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import AuthStack from './AuthStack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProfileGate } from '../lib/supabase/hooks/useProfileGate';
import SignedInStack from './SignedInStack';
import { useAuth } from '../providers/AuthProvider';
import { LoadingScreen } from '../components';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, ready } = useAuth();
  const gate = useProfileGate(session, ready);

  if (!ready || gate === 'loading') return <LoadingScreen label="Loading..." />;

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
