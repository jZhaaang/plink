import { supabase } from '@/lib/supabase';
import { Stack, router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();

  console.log('Rendering _layout.tsx');

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({ id: user.id }, { onConflict: 'id' });

          if (upsertError) {
            console.error('Upsert user error:', upsertError.message);
          }
        }
      }

      setChecking(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && pathname.startsWith('/auth')) {
        router.replace('/');
      } else if (!session && !pathname.startsWith('/auth')) {
        router.replace('/auth');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [pathname]);

  if (checking) return <Text>Checking auth...</Text>;

  return <Stack screenOptions={{ headerShown: false }} />;
}
