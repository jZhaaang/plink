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
      Burnt.toast({
        title: 'Party updated',
        preset: 'done',
        haptic: 'success',
      });
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
        banner={party.bannerUrl ? { uri: party.bannerUrl } : null}
        gradientColors={['#bfdbfe', '#3b82f6']}
        onBack={() => navigation.goBack()}
        onMenuPress={isOwner ? handleMenuPress : undefined}
      >
        <Text style={styles.heroTitle}>{party.name}</Text>
        <Text style={styles.heroSubtitle}>
          {party.members.length}{' '}
          {party.members.length === 1 ? 'member' : 'members'}
        </Text>
      </HeroBanner>

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
          <View style={styles.membersRow}>
            <AvatarStack avatarUris={memberAvatars} size={40} />
            {isOwner && (
              <Pressable onPress={() => setInviteModalVisible(true)}>
                <View style={styles.invitePill}>
                  <Feather name="user-plus" size={14} color="#2563eb" />
                  <Text style={styles.inviteText}>Invite</Text>
                </View>
              </Pressable>
            )}
          </View>

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
    color: 'rgba(255,255,255,0.7)',
  },
  contentArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
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
