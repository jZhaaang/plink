import { ComponentProps, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { PartyStackParamList } from '../../../navigation/types';
import { usePartyDetail } from '../hooks/usePartyDetail';
import { useDialog } from '../../../providers/DialogProvider';
import {
  createLink,
  getLinksByPartyId,
} from '../../../lib/supabase/queries/links';
import {
  deleteParty,
  updatePartyById,
} from '../../../lib/supabase/queries/parties';
import { parties as partiesStorage } from '../../../lib/supabase/storage/parties';
import { links as linksStorage } from '../../../lib/supabase/storage/links';
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
  Divider,
  LoadingScreen,
  DataFallbackScreen,
} from '../../../components';
import { PartyUpdate } from '../../../lib/models';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { compressImage } from '../../../lib/media/compress';
import { logger } from '../../../lib/telemetry/logger';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyDetail'>;

export default function PartyDetailScreen({ route, navigation }: Props) {
  const { partyId } = route.params;
  const { userId } = useAuth();
  const dialog = useDialog();
  const invalidate = useInvalidate();
  const insets = useSafeAreaInsets();

  const {
    party,
    loading: partyLoading,
    error: partyError,
    refetch: refetchParty,
  } = usePartyDetail(partyId);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const isOwner = party?.owner_id === userId;
  const activeLink = party?.links.find((l) => !l.end_time);
  const pastLinks = party?.links.filter((l) => l.end_time);
  const existingMemberIds = party?.members.map((m) => m.id);
  const memberAvatars = party?.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);

  if (partyLoading) return <LoadingScreen label="Loading..." />;
  if (partyError || !party)
    return <DataFallbackScreen onAction={refetchParty} />;

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
        setCreateModalVisible(false);
        trackEvent('link_created', { party_id: partyId, link_id: link.id });
        invalidate.partyDetail(partyId);
        invalidate.activeLink();
        invalidate.parties();
        invalidate.activity();
        navigation.navigate('LinkDetail', { linkId: link.id, partyId });
      }
    } catch (err) {
      await dialog.error('Error creating link', getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLinkPress = (linkId: string) => {
    navigation.navigate('LinkDetail', { linkId, partyId });
  };

  const handleEditParty = async (name: string, bannerUri: string | null) => {
    setEditLoading(true);
    try {
      const updates: PartyUpdate = {};

      if (name !== party?.name) {
        updates.name = name;
      }

      if (bannerUri && bannerUri !== party?.bannerUrl) {
        const compressed = await compressImage(bannerUri);
        const banner_path = await partiesStorage.upload(
          partyId,
          compressed.uri,
        );
        updates.banner_path = banner_path;
      }

      if (Object.keys(updates).length > 0) {
        await updatePartyById(partyId, updates);
      }

      setEditModalVisible(false);
      trackEvent('party_updated', { party_id: partyId });
      invalidate.partyDetail(partyId);
      invalidate.parties();
    } catch (err) {
      logger.error('Error updating party', { err });
      await dialog.error('Failed to Update Party', getErrorMessage(err));
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
      const linkIds = (await getLinksByPartyId(partyId)).map((l) => l.id);

      const partyPaths = await partiesStorage.getPathsById(partyId);
      await partiesStorage.remove(partyPaths);

      await Promise.all(
        linkIds.map(async (linkId) => {
          const linkPaths = await linksStorage.getPathsById(linkId);
          await linksStorage.remove(linkPaths);
        }),
      );

      await deleteParty(partyId);
      trackEvent('party_deleted', { party_id: partyId });
      invalidate.parties();
      invalidate.activeLink();
      invalidate.activity();
      navigation.goBack();
    } catch (err) {
      logger.error('Error deleting party', { err });
      await dialog.error('Failed to Delete Party', getErrorMessage(err));
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
      label: 'Edit Party',
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

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar style="light" />
      <View style={{ height: insets.top, overflow: 'hidden' }}>
        {party.bannerUrl ? (
          <>
            <Image
              source={{ uri: party.bannerUrl }}
              cachePolicy="memory-disk"
              contentFit="cover"
              blurRadius={20}
              style={{ width: '100%', height: insets.top + 40 }}
            />
            <View
              className="absolute inset-0 bg-black/20"
              pointerEvents="none"
            />
          </>
        ) : (
          <LinearGradient
            colors={['#bfdbfe', '#3b82f6']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        )}
      </View>

      <View className="flex-1 bg-neutral-50">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={partyLoading}
              onRefresh={refetchParty}
            />
          }
        >
          {/* Hero Banner */}
          <View className="w-full" style={{ aspectRatio: 2.5 }}>
            {party.bannerUrl ? (
              <Image
                source={{ uri: party.bannerUrl }}
                cachePolicy="memory-disk"
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

          <Divider className="my-6" />

          {/* Active Link */}
          <View className="px-5">
            {activeLink ? (
              <>
                <SectionHeader title="Active Link" />
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
            existingMemberIds={existingMemberIds}
            onSuccess={() => {
              invalidate.partyDetail(partyId);
              invalidate.activity();
            }}
          />
        )}
      </View>
    </View>
  );
}
