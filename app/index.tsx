import Button from '@/components/Button';
import Container from '@/components/Container';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

export default function Index() {
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Container className="flex-1 justify-center items-center">
      <View className="gap-6 items-center">
        <Text className="text-3x1 font-bold text-blue-600 text-lg">pLink</Text>
        <Text className="text-base text-gray-600 text-center">Start linking with your friends</Text>

        <View className="mt-6 w-full gap-4">
          <Button title="Go to Profile" onPress={() => router.push('/profile')} />
          <Button title="Go to Parties" onPress={() => router.push('/parties')} />
          <Button title="Log out" intent="secondary" onPress={logout} />
        </View>
      </View>
    </Container>
  );
}
