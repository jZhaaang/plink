import { getUserById, supabase, upsertUser } from '@/lib/supabase';
import AppNavigator from '@/navigation/AppNavigator';
import { getNavLinkingConfig } from '@/navigation/linking';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function AuthGate() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setAuthenticated(false);
      } else {
        const { data: profile } = await getUserById(user.id);

        setNeedsProfile(!profile?.name);
        setAuthenticated(true);
      }

      setChecking(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setAuthenticated(!!user);

      if (user) {
        await upsertUser({ id: user.id, email: user.email });
        const { data: profile } = await getUserById(user.id);
        setNeedsProfile(!profile?.name);
      }
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
    <NavigationContainer linking={getNavLinkingConfig()}>
      <AppNavigator
        isAuthenticated={authenticated}
        needsProfile={needsProfile}
        onProfileComplete={() => setNeedsProfile(false)}
      />
    </NavigationContainer>
  );
}
