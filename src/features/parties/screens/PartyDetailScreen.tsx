import { ComponentProps, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { PartyStackParamList } from '../../../navigation/types';
import { usePartyDetail } from '../hooks/usePartyDetail';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { useDialog } from '../../../providers/DialogProvider';
import { createLink } from '../../../lib/supabase/queries/links';
import { createLinkMember } from '../../../lib/supabase/queries/linkMembers';
import {
  deleteParty,
  updatePartyById,
} from '../../../lib/supabase/queries/parties';
import { parties as partiesStorage } from '../../../lib/supabase/storage/parties';
import { PartyCard } from '../components/PartyCard';
import AvatarStack from '../../../components/AvatarStack';
import LinkCard from '../../links/components/LinkCard';
import CreateLinkModal from '../../links/components/CreateLinkModal';
import CreatePartyModal from '../components/CreatePartyModal';
import {
  Button,
  SectionHeader,
  EmptyState,
  Divider,
  DropdownMenu,
  DropdownMenuItem,
} from '../../../components';
import { PartyUpdate } from '../../../lib/models';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyDetail'>;

export default function PartyDetailScreen({ route, navigation }: Props) {
  const { partyId } = route.params;
  const { session } = useAuth();
  const userId = session?.user?.id;
  const dialog = useDialog();

  const { party, links, loading, error, refetch } = usePartyDetail(partyId);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const isOwner = party?.owner_id === userId;
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
      await dialog.error('Error creating link', err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLinkPress = (linkId: string) => {
    navigation.navigate('LinkDetail', { linkId, partyId });
  };

  const handleEditParty = async (
    name: string,
    avatarUri: string | null,
    bannerUri: string | null,
  ) => {
    setEditLoading(true);
    try {
      const updates: PartyUpdate = {};

      if (name !== party?.name) {
        updates.name = name;
      }

      if (avatarUri && avatarUri !== party?.avatarUrl) {
        const avatar_path = await partiesStorage.upload(
          partyId,
          'avatar',
          avatarUri,
        );
        updates.avatar_path = avatar_path;
      }

      if (bannerUri && bannerUri !== party?.bannerUrl) {
        const banner_path = await partiesStorage.upload(
          partyId,
          'banner',
          bannerUri,
        );
        updates.banner_path = banner_path;
      }

      if (Object.keys(updates).length > 0) {
        await updatePartyById(partyId, updates);
      }

      setEditModalVisible(false);
      refetch();
    } catch (err) {
      await dialog.error('Error updating party', err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteParty = async () => {
    setMenuVisible(false);
    const confirmed = await dialog.confirmDanger(
      'Delete Party?',
      'This will permanently delete the party and all its links. This cannot be undone.',
    );

    if (!confirmed) return;

    try {
      await deleteParty(partyId);
      navigation.goBack();
    } catch (err) {
      await dialog.error('Error deleting party', err.message);
    }
  };

  const handleMenuPress = (event: GestureResponderEvent) => {
    event.currentTarget.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setMenuAnchor({ x: x + width, y: y + height });
        setMenuVisible(true);
      },
    );
  };

  const menuItems = useMemo(() => {
    const items: Array<{
      icon: ComponentProps<typeof Feather>['name'];
      label: string;
      action: () => void;
      variant?: 'danger';
    }> = [];

    if (isOwner) {
      items.push({
        icon: 'edit-2',
        label: 'Edit Name',
        action: () => {
          setMenuVisible(false);
          setEditModalVisible(true);
        },
      });
      items.push({
        icon: 'trash-2',
        label: 'Delete Party',
        action: handleDeleteParty,
        variant: 'danger',
      });
    }

    return items;
  }, [isOwner]);

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
        <Text className="flex-1 text-lg font-semibold text-center">
          {party.name}
        </Text>
        {isOwner && (
          <Pressable onPress={handleMenuPress} className="p-2 -mr-2">
            <Feather name="more-vertical" size={24} color="#333" />
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Party Header with banner/avatar */}
        <View className="px-4">
          <PartyCard
            variant="expanded"
            name={party.name}
            avatarUri={party.avatarUrl}
            bannerUri={party.bannerUrl}
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

      {/* Dropdown Menu */}
      {isOwner && (
        <DropdownMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          anchor={menuAnchor}
        >
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onPress={item.action}
              variant={item.variant}
            />
          ))}
        </DropdownMenu>
      )}

      {/* Edit Party Modal */}
      {isOwner && (
        <CreatePartyModal
          visible={editModalVisible}
          initialParty={party}
          loading={editLoading}
          onClose={() => setEditModalVisible(false)}
          onSubmit={handleEditParty}
        />
      )}
    </SafeAreaView>
  );
}
