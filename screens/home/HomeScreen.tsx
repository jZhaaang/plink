import { supabase } from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import Button from '@/ui/components/Button';
import Container from '@/ui/components/Container';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function Index() {
  const navigation = useNavigation<Nav>();

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Container className="flex-1 justify-center items-center">
      <View className="gap-6 items-center">
        <Text className="text-3x1 font-bold text-blue-600 text-lg">pLink</Text>
        <Text className="text-base text-gray-600 text-center">Start linking with your friends</Text>

        <View className="mt-6 w-full gap-4">
          <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} />
          <Button title="Go to Parties" onPress={() => navigation.navigate('PartyList')} />
          <Button title="Log out" intent="secondary" onPress={logout} />
        </View>
      </View>
    </Container>
  );
}
