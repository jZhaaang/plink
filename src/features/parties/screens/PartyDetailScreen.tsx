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
import { parties as partiesStorage } from '../../../lib/media-service/parties';
import { deleteBulk } from '../../../lib/media-service/client';
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
import { StatusBar } from 'expo-status-bar';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { compressImage } from '../../../lib/media/compress';
import { logger } from '../../../lib/telemetry/logger';
import * as Burnt from 'burnt';
import HeroBanner from '../../../components/HeroBanner';
import { StyleSheet } from 'react-native-unistyles';
import MemberAvatar from '../../../components/MemberAvatar';

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
        Burnt.toast({
          title: 'Link started!',
          preset: 'done',
          haptic: 'success',
        });
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

  const handleEditParty = async (
    name: string,
    avatarUri: string | null,
    bannerUri: string | null,
  ) => {
    setEditLoading(true);
    let avatarPath = null;
    let bannerPath = null;

    try {
      const updates: PartyUpdate = {};

      if (name !== party?.name) {
        updates.name = name;
      }

      if (avatarUri && avatarUri !== party?.avatarUrl) {
        const compressed = await compressImage(avatarUri);
        avatarPath = await partiesStorage.upload(
          partyId,
          { type: 'avatar' },
          compressed.uri,
        );
        updates.avatar_path = avatarPath;
      }

      if (bannerUri && bannerUri !== party?.bannerUrl) {
        const compressed = await compressImage(bannerUri);
        bannerPath = await partiesStorage.upload(
          partyId,
          { type: 'banner' },
          compressed.uri,
        );
        updates.banner_path = bannerPath;
      }

      if (Object.keys(updates).length > 0) {
        await updatePartyById(partyId, updates);
      }

      setEditModalVisible(false);
      trackEvent('party_updated', { party_id: partyId });
      invalidate.partyDetail(partyId);
      invalidate.parties();
      Burnt.toast({
        title: 'Party updated',
        preset: 'done',
        haptic: 'success',
      });
    } catch (err) {
      if (avatarPath) {
        await partiesStorage.remove([avatarPath]);
      }
      if (bannerPath) {
        await partiesStorage.remove([bannerPath]);
      }
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

      await Promise.all(linkIds.map((linkId) => deleteBulk(`links/${linkId}`)));
      await deleteBulk(`parties/${partyId}`);

      await deleteParty(partyId);
      trackEvent('party_deleted', { party_id: partyId });
      invalidate.parties();
      invalidate.activeLink();
      invalidate.activity();
      Burnt.toast({
        title: 'Party deleted',
        preset: 'done',
        haptic: 'success',
      });
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
    <View style={styles.root}>
      <StatusBar style="light" />

      <HeroBanner
        variant="avatar-only"
        avatarUri={party.avatarUrl ?? null}
        bannerUri={party.bannerUrl ?? null}
        onBack={() => navigation.goBack()}
        onMenuPress={isOwner ? handleMenuPress : undefined}
      />

      <View style={styles.contentArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={partyLoading}
              onRefresh={refetchParty}
            />
          }
        >
          {/* Members */}
          <View style={styles.section}>
            <SectionHeader
              title="Members"
              count={party.members.length}
              action={
                isOwner ? (
                  <Pressable onPress={() => setInviteModalVisible(true)}>
                    <View style={styles.invitePill}>
                      <Feather name="user-plus" size={14} color="#2563eb" />
                      <Text style={styles.inviteText}>Invite</Text>
                    </View>
                  </Pressable>
                ) : undefined
              }
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersList}
          >
            {party.members.map((member) => (
              <MemberAvatar key={member.id} member={member} />
            ))}
          </ScrollView>

          <Divider style={{ marginVertical: 24 }} />

          {/* Active Link */}
          <View style={styles.section}>
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
            style={[
              styles.section,
              {
                marginTop: 24,
                paddingBottom: Math.max(insets.bottom, 32),
              },
            ]}
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

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textInverse,
  },
  heroSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textInverseMuted,
  },
  contentArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  membersList: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  invitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
  },
  inviteText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
  },
}));
