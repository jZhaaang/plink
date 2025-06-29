import { supabase } from '@/lib/supabase';
import { Stack, router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();

  console.log('Rendering _layout.tsx');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        const { error: upsertError } = await supabase.from('users').insert({});

        if (upsertError) {
          console.error('Upsert user error:', upsertError.message);
        }
      }

      const target = session ? '/' : '/auth';
      if (pathname !== target) router.replace(target);

      setChecking(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const target = session ? '/' : '/auth';
      if (pathname !== target) router.replace(target);
    });

    return () => listener.subscription.unsubscribe();
  }, [pathname]);

  if (checking) return <Text>Checking auth...</Text>;

  return <Stack />;
}
