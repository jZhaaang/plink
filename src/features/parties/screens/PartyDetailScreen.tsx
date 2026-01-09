import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { PartyStackParamList } from '../../../navigation/types';
import { usePartyDetail } from '../hooks/usePartyDetail';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { useDialog } from '../../../providers/DialogProvider';
import { createLink } from '../../../lib/supabase/queries/links';
import { createLinkMember } from '../../../lib/supabase/queries/linkMembers';
import PartyDetail from '../components/PartyDetail';
import AvatarStack from '../../../components/AvatarStack';
import LinkCard from '../../links/components/LinkCard';
import CreateLinkModal from '../../links/components/CreateLinkModal';
import { Button, SectionHeader, EmptyState, Divider } from '../../../components';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyDetail'>;

export default function PartyDetailScreen({ route, navigation }: Props) {
  const { partyId } = route.params;
  const { session } = useAuth();
  const userId = session?.user?.id;
  const dialog = useDialog();

  const { party, links, loading, error, refetch } = usePartyDetail(partyId);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const activeLink = links.find((l) => !l.end_time);
  const pastLinks = links.filter((l) => l.end_time);

  const handleCreateLink = async (name: string) => {
    if (!userId) return;

    setCreateLoading(true);
    try {
      const link = await createLink({
        name,
        party_id: partyId,
        owner_id: userId,
      });

      if (link) {
        await createLinkMember({ link_id: link.id, user_id: userId });
        setCreateModalVisible(false);
        refetch();
        navigation.navigate('LinkDetail', { linkId: link.id, partyId });
      }
    } catch (err) {
      dialog.error('Error', 'Failed to create link. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLinkPress = (linkId: string) => {
    navigation.navigate('LinkDetail', { linkId, partyId });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !party) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6 bg-neutral-50">
        <Text className="text-center text-neutral-600 mb-4">
          Failed to load party details.
        </Text>
        <Button title="Retry" variant="outline" onPress={refetch} />
      </SafeAreaView>
    );
  }

  const memberAvatars = party.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#333" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-center mr-8">
          {party.name}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Party Header with banner/avatar */}
        <View className="px-4">
          <PartyDetail
            name={party.name}
            avatarUri={party.avatarUrl}
            bannerUri={party.bannerUrl}
            mode="regular"
          />
        </View>

        {/* Members Section */}
        <View className="mt-6 px-4">
          <SectionHeader title="Members" count={party.members.length} />
          <AvatarStack avatarUris={memberAvatars} size={44} />
        </View>

        <Divider className="my-6" />

        {/* Active Link Section */}
        <View className="px-4">
          <SectionHeader
            title="Active Link"
            action={
              !activeLink ? (
                <Pressable
                  onPress={() => setCreateModalVisible(true)}
                  className="flex-row items-center"
                >
                  <Feather name="plus" size={18} color="#2563eb" />
                  <Text className="text-blue-600 font-medium ml-1">Start</Text>
                </Pressable>
              ) : null
            }
          />

          {activeLink ? (
            <LinkCard link={activeLink} onPress={handleLinkPress} />
          ) : (
            <EmptyState
              icon="link"
              title="No active link"
              message="Start a link to capture memories together"
              action={
                <Button
                  title="Start Link"
                  size="sm"
                  onPress={() => setCreateModalVisible(true)}
                />
              }
            />
          )}
        </View>

        <Divider className="my-6" />

        {/* Past Links Section */}
        <View className="px-4 pb-8">
          <SectionHeader title="Past Links" count={pastLinks.length} />

          {pastLinks.length === 0 ? (
            <EmptyState
              icon="archive"
              title="No past links"
              message="Your completed links will appear here"
            />
          ) : (
            pastLinks.map((link) => (
              <LinkCard key={link.id} link={link} onPress={handleLinkPress} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Link Modal */}
      <CreateLinkModal
        visible={createModalVisible}
        loading={createLoading}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateLink}
      />
    </SafeAreaView>
  );
}
