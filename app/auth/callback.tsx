import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { error } = await supabase.auth.getSession();
      if (!error) router.replace('/');
    };

    handleAuthRedirect();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Finishing login...</Text>
    </View>
  );
}
