import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabsParamList } from '../../../navigation/types';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FlatList,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { usePartiesWithMembers } from '../hooks/usePartiesWithMembers';
import { PartyCard } from '../components/PartyCard';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../../components';

type Props = NativeStackScreenProps<TabsParamList, 'PartyList'>;

export default function PartyListScreen({ navigation }: Props) {
  const { session, ready } = useAuth();
  const userId = session?.user?.id ?? undefined;

  const { parties, loading, error, refetch } = usePartiesWithMembers(userId);

  const createParty = () => {};
  const goDetail = () => {};

  if (loading || !ready) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-neutral-600">
          Failed to load parties. Pull to retry.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <View className="flex-1 bg-neutral-50">
        <FlatList
          data={parties}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <PartyCard party={item} onPress={goDetail} />
          )}
          ListEmptyComponent={
            <View className="items-center mt-20 px-6">
              <Text className="text-lg font-semibold mb-2">No parties yet</Text>
              <Text className="text-neutral-600 mb-6 text-center">
                Create your first party to start linking with friends.
              </Text>
              <Button
                title="Create a Party"
                variant="primary"
                size="md"
                onPress={createParty}
              />
            </View>
          }
        ></FlatList>
        {parties.length ? (
          <Pressable
            onPress={createParty}
            className="absolute right-5 bottom-8 h-14 w-14 rounded-full bg-white-900 items-center justify-center shadow-2xl"
            accessibilityLabel="Create a new party"
          >
            <Feather name="plus" size={18} color="blue" />
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
