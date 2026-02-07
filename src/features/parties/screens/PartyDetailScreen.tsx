import { ComponentProps, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import AvatarStack from '../../../components/AvatarStack';
import LinkCard from '../../links/components/LinkCard';
import CreateLinkModal from '../../links/components/CreateLinkModal';
import CreatePartyModal from '../components/CreatePartyModal';
import InviteMemberModal from '../components/InviteMemberModal';
import {
  Button,
  SectionHeader,
  EmptyState,
  DropdownMenu,
  DropdownMenuItem,
} from '../../../components';
import { PartyUpdate } from '../../../lib/models';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyDetail'>;

export default function PartyDetailScreen({ route, navigation }: Props) {
  const { partyId } = route.params;
  const { session } = useAuth();
  const userId = session?.user?.id;
  const dialog = useDialog();

  const { data: party, loading, error, refetch } = usePartyDetail(partyId);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const insets = useSafeAreaInsets();

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

  const isOwner = party?.owner_id === userId;
  const activeLink = party.links.find((l) => !l.end_time);
  const pastLinks = party.links.filter((l) => l.end_time);

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

  const menuItems: Array<{
    icon: ComponentProps<typeof Feather>['name'];
    label: string;
    action: () => void;
    variant?: 'danger';
  }> = [];

  if (isOwner) {
    menuItems.push({
      icon: 'user-plus',
      label: 'Invite Member',
      action: () => {
        setMenuVisible(false);
        setInviteModalVisible(true);
      },
    });
    menuItems.push({
      icon: 'edit-2',
      label: 'Edit Name',
      action: () => {
        setMenuVisible(false);
        setEditModalVisible(true);
      },
    });
    menuItems.push({
      icon: 'trash-2',
      label: 'Delete Party',
      action: handleDeleteParty,
      variant: 'danger',
    });
  }

  const memberAvatars = party.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);

  return (
  <View className="flex-1 bg-neutral-900">
    <View
      className="flex-1 bg-neutral-50"
      style={{ marginTop: insets.top }}
    >
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Hero Banner */}
        <View className="h-56 w-full">
          {party.bannerUrl ? (
            <Image
              source={{ uri: party.bannerUrl }}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <LinearGradient
              colors={['#bfdbfe', '#3b82f6']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          )}

          {/* Bottom gradient for text legibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            className="absolute bottom-0 left-0 right-0 h-28"
          />

          {/* Party name overlaid on banner */}
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <Text className="text-2xl font-bold text-white">
              {party.name}
            </Text>
            <Text className="text-sm text-white/70 mt-1">
              {party.members.length}{' '}
              {party.members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        {/* Members */}
        <View className="flex-row items-center justify-between px-5 mt-5">
          <AvatarStack avatarUris={memberAvatars} size={40} />
          {isOwner && (
            <Pressable
              onPress={() => setInviteModalVisible(true)}
              className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full"
            >
              <Feather name="user-plus" size={14} color="#2563eb" />
              <Text className="text-blue-600 text-xs font-semibold ml-1.5">
                Invite
              </Text>
            </Pressable>
          )}
        </View>

        {/* Active Link */}
        <View className="px-5 mt-6">
          {activeLink ? (
            <>
              <SectionHeader title="Active Link" count={0} />
              <LinkCard link={activeLink} onPress={handleLinkPress} />
            </>
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

        {/* Past Links */}
        <View
          className="px-5 mt-6"
          style={{ paddingBottom: Math.max(insets.bottom, 32) }}
        >
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

      {/* Floating nav over banner */}
      <View
        className="absolute top-0 left-0 right-0"
        pointerEvents="box-none"
      >
        <View
          className="flex-row items-center justify-between px-4 py-2"
          pointerEvents="box-none"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-black/30 items-center justify-center"
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>

          {isOwner ? (
            <Pressable
              onPress={handleMenuPress}
              className="w-9 h-9 rounded-full bg-black/30 items-center justify-center"
            >
              <Feather name="more-vertical" size={20} color="#fff" />
            </Pressable>
          ) : (
            <View className="w-9" />
          )}
        </View>
      </View>

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

      {/* Invite Member Modal */}
      {isOwner && (
        <InviteMemberModal
          visible={inviteModalVisible}
          onClose={() => setInviteModalVisible(false)}
          partyId={partyId}
          existingMemberIds={party.members.map((m) => m.id)}
          onSuccess={refetch}
        />
      )}
    </View>
  </View>
);
}