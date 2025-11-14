import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartyStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { parties as partiesStorage } from '../../../lib/supabase/storage/parties';
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
import { Button, Divider } from '../../../components';
import { useDialog } from '../../../providers/DialogProvider';
import { useState } from 'react';
import CreatePartyModal from '../components/CreatePartyModal';
import {
  createPartyWithOwner,
  updatePartyById,
} from '../../../lib/supabase/queries/parties';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyList'>;

export default function PartyListScreen({ navigation }: Props) {
  const { session, ready } = useAuth();
  const userId = session?.user?.id ?? undefined;
  const dialog = useDialog();

  const {
    parties,
    loading: partiesLoading,
    error,
    refetch,
  } = usePartiesWithMembers(userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    name: string,
    avatarUri: string | null,
    bannerUri: string | null,
  ) => {
    if (!name.trim()) {
      await dialog.error('Missing info', 'Name cannot be empty');
      return;
    }
    if (!avatarUri || !bannerUri) {
      await dialog.error('Missing info', 'Choose an avatar and banner image');
      return;
    }
    setLoading(true);

    try {
      const party = await createPartyWithOwner({ name, owner_id: userId });

      let avatar_path = null,
        banner_path = null;

      if (avatarUri)
        avatar_path = await partiesStorage.upload(
          party.id,
          'avatar',
          avatarUri,
        );
      if (bannerUri)
        banner_path = await partiesStorage.upload(
          party.id,
          'banner',
          bannerUri,
        );

      await updatePartyById(party.id, { avatar_path, banner_path });
      refetch();
    } catch (err) {
      await dialog.error('Error creating party', err.message);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  if (partiesLoading || !ready) {
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
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
      <View className="flex-1 bg-neutral-50 px-4">
        <Text className="text-xl font-bold mb-4">Your Parties</Text>
        <Divider />
        <FlatList
          data={parties}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshing={partiesLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <PartyCard
              party={item}
              onPress={(partyId) =>
                navigation.navigate('PartyDetail', { partyId })
              }
            />
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
                onPress={() => setModalVisible(true)}
              />
            </View>
          }
        ></FlatList>
        {parties.length ? (
          <Pressable
            onPress={() => setModalVisible(true)}
            className="absolute right-5 bottom-8 h-14 w-14 rounded-full bg-white-900 items-center justify-center shadow-2xl"
            accessibilityLabel="Create a new party"
          >
            <Feather name="plus" size={18} color="blue" />
          </Pressable>
        ) : null}

        <CreatePartyModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={(name, avatarUri, bannerUri) =>
            handleSubmit(name, avatarUri, bannerUri)
          }
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}
