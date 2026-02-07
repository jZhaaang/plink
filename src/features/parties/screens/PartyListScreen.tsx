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
import { LinearGradient } from 'expo-linear-gradient';
import { PartyCard } from '../components/PartyCard';
import { Feather } from '@expo/vector-icons';
import { Button, Divider, EmptyState } from '../../../components';
import { useDialog } from '../../../providers/DialogProvider';
import { useState } from 'react';
import CreatePartyModal from '../components/CreatePartyModal';
import {
  createPartyWithOwner,
  updatePartyById,
} from '../../../lib/supabase/queries/parties';
import { usePartyListItems } from '../hooks/usePartyListItems';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyList'>;

export default function PartyListScreen({ navigation }: Props) {
  const { session, ready } = useAuth();
  const userId = session?.user?.id ?? undefined;
  const dialog = useDialog();

  const { parties, loading: partiesLoading, error, refetch } = usePartyListItems(userId);
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
              variant="compact"
              name={item.name}
              avatarUri={item.avatarUrl}
              bannerUri={item.bannerUrl}
              members={item.members}
              onPress={() =>
                navigation.navigate('PartyDetail', { partyId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title="No parties yet"
              message="Create your first party to start linking with friends."
              action={
                <Button
                  title="Create a Party"
                  variant="primary"
                  size="md"
                  onPress={() => setModalVisible(true)}
                />
              }
            />
          }
        ></FlatList>
        {parties.length ? (
          <Pressable
            onPress={() => setModalVisible(true)}
            className="absolute right-5 bottom-5 overflow-hidden rounded-full shadow-lg active:scale-95"
            style={{ elevation: 8 }}
            accessibilityLabel="Create a new party"
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center px-5 py-4 gap-2"
            >
              <Feather name="plus" size={20} color="white" />
              <Text className="text-white font-semibold">New Party</Text>
            </LinearGradient>
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
