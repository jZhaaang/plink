import { useState } from 'react';
import {
  Text,
  View,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Modal } from '../../../components';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { useDialog } from '../../../providers/DialogProvider';
import { usePartyListItems } from '../../parties/hooks/usePartyListItems';
import { useActiveLinkContext } from '../../../providers/ActiveLinkProvider';
import { createLink } from '../../../lib/supabase/queries/links';
import { createLinkMember } from '../../../lib/supabase/queries/linkMembers';
import CreateLinkModal from '../components/CreateLinkModal';
import type { PartyListItem } from '../../../lib/models';
import { SignedInParamList } from '../../../navigation/types';

export default function CreateLinkFlowScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const dialog = useDialog();
  const navigation = useNavigation<NavigationProp<SignedInParamList>>();
  const { createLinkVisible, closeCreateLink, refetch } =
    useActiveLinkContext();
  const { parties, loading: partiesLoading } = usePartyListItems(
    userId ?? null,
  );

  const [selectedParty, setSelectedParty] = useState<PartyListItem | null>(
    null,
  );
  const [createLoading, setCreateLoading] = useState(false);

  const handleClose = () => {
    setSelectedParty(null);
    closeCreateLink();
  };

  const handleSubmit = async (name: string) => {
    if (!userId || !selectedParty) return;

    setCreateLoading(true);
    try {
      const link = await createLink({
        name,
        party_id: selectedParty.id,
        owner_id: userId,
      });

      if (link) {
        await createLinkMember({ link_id: link.id, user_id: userId });
        handleClose();
        await refetch();
        navigation.navigate('App', {
          screen: 'Link',
          params: {
            screen: 'LinkDetail',
            params: { linkId: link.id, partyId: selectedParty.id },
          },
        });
      }
    } catch (err) {
      await dialog.error('Error creating link', err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  if (selectedParty) {
    return (
      <CreateLinkModal
        visible={createLinkVisible}
        loading={createLoading}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <Modal
      visible={createLinkVisible}
      onClose={handleClose}
      animationType="slide"
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Start a Link</Text>
        <Pressable onPress={handleClose} className="p-2">
          <Text className="text-neutral-500">Close</Text>
        </Pressable>
      </View>

      <Text className="text-sm text-slate-500 mb-4">
        Which party do you want to start a link in?
      </Text>

      {partiesLoading ? (
        <ActivityIndicator className="my-8" />
      ) : parties.length === 0 ? (
        <Text className="text-center text-slate-400 my-8">
          You are not in any parties yet.
        </Text>
      ) : (
        <FlatList
          data={parties}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedParty(item)}
              className="flex-row items-center py-3 px-2 rounded-xl active:bg-slate-100"
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Feather name="users" size={18} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-neutral-800">
                  {item.name}
                </Text>
                <Text className="text-xs text-slate-400">
                  {item.members.length}{' '}
                  {item.members.length === 1 ? 'member' : 'members'}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </Pressable>
          )}
        />
      )}
    </Modal>
  );
}
