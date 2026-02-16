import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartyStackParamList } from '../../../navigation/types';
import { parties as partiesStorage } from '../../../lib/supabase/storage/parties';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PartyCard } from '../components/PartyCard';
import { Feather } from '@expo/vector-icons';
import {
  Button,
  Divider,
  EmptyState,
  LoadingScreen,
} from '../../../components';
import { useDialog } from '../../../providers/DialogProvider';
import { useState } from 'react';
import CreatePartyModal from '../components/CreatePartyModal';
import {
  createParty,
  updatePartyById,
} from '../../../lib/supabase/queries/parties';
import { usePartyListItems } from '../hooks/usePartyListItems';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyList'>;

export default function PartyListScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const dialog = useDialog();
  const invalidate = useInvalidate();

  const {
    parties,
    loading: partiesLoading,
    error,
    refetch,
  } = usePartyListItems(userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (name: string, bannerUri: string | null) => {
    if (!name.trim()) {
      await dialog.error('Missing info', 'Name cannot be empty');
      return;
    }
    if (!bannerUri) {
      await dialog.error('Missing info', 'Choose a banner image');
      return;
    }
    setLoading(true);

    try {
      const party = await createParty({ name, owner_id: userId });

      let banner_path = null;

      if (bannerUri) {
        banner_path = await partiesStorage.upload(party.id, bannerUri);
      }

      await updatePartyById(party.id, { banner_path });
      invalidate.parties();
    } catch (err) {
      await dialog.error('Error creating party', getErrorMessage(err));
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  if (partiesLoading) return <LoadingScreen label="Loading..." />;

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
              name={item.name}
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
          onSubmit={(name, bannerUri) => handleSubmit(name, bannerUri)}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}
