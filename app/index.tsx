import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Index() {
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>pLink</Text>
      <Button title="Go to Profile" onPress={() => router.push('/profile')} />
      <Button title="Log out" onPress={logout} />
    </View>
  );
}
