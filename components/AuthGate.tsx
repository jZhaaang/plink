import { supabase, upsertUser } from '@/lib/supabase';
import AppNavigator from '@/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function AuthGate() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setAuthenticated(false);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await upsertUser({ id: user.id });
        }
        setAuthenticated(true);
      }

      setChecking(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Checking auth...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator isAuthenticated={authenticated} />
    </NavigationContainer>
  );
}
