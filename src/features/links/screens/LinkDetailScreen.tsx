import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  GestureResponderEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PartyStackParamList } from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import { useLinkDetailActions } from '../hooks/useLinkDetailActions';
import AvatarStack from '../../../components/AvatarStack';
import MediaGrid from '../components/MediaGrid';
import PostFeedItem from '../components/PostFeedItem';
import CreateLinkModal from '../components/CreateLinkModal';
import {
  EmptyState,
  Divider,
  SectionHeader,
  DropdownMenu,
  DropdownMenuItem,
  Card,
  LoadingScreen,
  DataFallbackScreen,
} from '../../../components';
import { useStagedMedia } from '../hooks/useStagedMedia';
import StagedMediaSheet from '../components/StagedMediaSheet';
import UploadProgressModal from '../../../components/UploadProgressModal';
import { formatDateTime, formatDuration } from '../../../lib/utils/formatTime';
import { useActiveLinkContext } from '../../../providers/ActiveLinkProvider';
import { CardSection } from '../../../components/Card';
import { StatusBar } from 'expo-status-bar';
import { LinkPostMedia } from '../../../lib/models';
import CameraModal from '../components/CameraModal';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import EditLinkBannerModal from '../components/EditLinkBannerModal';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useAuth } from '../../../providers/AuthProvider';
import * as Burnt from 'burnt';
import HeroBanner from '../../../components/HeroBanner';
import { StyleSheet } from 'react-native-unistyles';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId, partyId } = route.params;
  const { userId } = useAuth();

  const {
    link,
    loading: linkLoading,
    error: linkError,
    refetch: refetchLink,
  } = useLinkDetail(linkId);

  const linkActions = useLinkDetailActions({
    linkId,
    partyId,
    link,
    onDelete: () => {
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        parentNavigation.dispatch(
          CommonActions.navigate('Party', {
            screen: 'PartyDetail',
            params: { partyId },
          }),
        );
        return;
      }
      navigation.goBack();
    },
    onLeave: () => navigation.goBack(),
  });

  const { uploadAction, clearUploadAction } = useActiveLinkContext();

  const onUploadError = useCallback((error: unknown) => {
    Burnt.toast({
      title: `Upload failed: ${getErrorMessage(error)}`,
      preset: 'error',
      haptic: 'error',
    });
  }, []);

  const {
    stagedAssets,
    stageAssets,
    addFromGallery,
    removeAsset,
    clearAll,
    uploadAll,
    uploading,
    progress,
    hasAssets,
  } = useStagedMedia({
    linkId,
    partyId,
    userId,
    onError: onUploadError,
  });

  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editBannerVisible, setEditBannerVisible] = useState(false);

  const allMedia = useMemo(() => {
    if (!link) return [];
    return link.posts.flatMap((post) => post.media);
  }, [link]);
  const imageMedia = useMemo(
    () => allMedia.filter((media) => media.type === 'image'),
    [allMedia],
  );

  useFocusEffect(
    useCallback(() => {
      if (!uploadAction) return;
      clearUploadAction();

      switch (uploadAction) {
        case 'camera-photo':
          setCameraMode('photo');
          break;
        case 'camera-video':
          setCameraMode('video');
          break;
        case 'gallery':
          addFromGallery();
          break;
      }
    }, [uploadAction, clearUploadAction]),
  );

  if (linkLoading) return <LoadingScreen label="Loading..." />;
  if (linkError || !link) return <DataFallbackScreen onAction={refetchLink} />;

  const startFormatted = formatDateTime(link.created_at);
  const endFormatted = formatDateTime(link.end_time);
  const isActive = link && !link.end_time;
  const isOwner = link.owner_id === userId;
  const isMember = link.members.some((m) => m.id === userId) ?? false;
  const memberAvatars = link.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);
  const owner = link.members.find((m) => m.id === link.owner_id);

  const handleMediaPress = (item: LinkPostMedia) => {
    const index = allMedia.findIndex((m) => m.id === item.id);
    navigation.navigate('MediaViewer', {
      linkId,
      initialIndex: index === -1 ? 0 : index,
    });
  };

  const handleSeeAllMedia = () => {
    navigation.navigate('AllMedia', { linkId });
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
      icon: 'edit-2',
      label: 'Edit Name',
      action: () => {
        setMenuVisible(false);
        setEditModalVisible(true);
      },
    });
    menuItems.push({
      icon: 'image',
      label: 'Edit Banner',
      action: () => {
        setMenuVisible(false);
        setEditBannerVisible(true);
      },
    });

    if (isActive) {
      menuItems.push({
        icon: 'check-circle',
        label: 'End Link',
        action: () => {
          setMenuVisible(false);
          linkActions.endLink();
        },
      });
    }

    menuItems.push({
      icon: 'trash-2',
      label: 'Delete Link',
      action: () => {
        setMenuVisible(false);
        linkActions.deleteLink();
      },
      variant: 'danger',
    });
  } else if (isMember) {
    menuItems.push({
      icon: 'log-out',
      label: 'Leave Link',
      action: () => {
        setMenuVisible(false);
        linkActions.leaveLink();
      },
      variant: 'danger',
    });
  } else if (isActive) {
    menuItems.push({
      icon: 'log-in',
      label: 'Join Link',
      action: () => {
        setMenuVisible(false);
        linkActions.joinLink();
      },
    });
  }

  const handleEditName = async (newName: string) => {
    await linkActions.editName(newName);
    setEditModalVisible(false);
  };

  const handleSaveBanner = async (croppedUri: string) => {
    await linkActions.saveBanner(croppedUri);
    setEditBannerVisible(false);
  };

  return (
    <>
      <View style={styles.root}>
        <StatusBar style="light" />

        <HeroBanner
          banner={
            link.bannerUrl
              ? {
                  uri: link.bannerUrl,
                  cropX: link.banner_crop_x,
                  cropY: link.banner_crop_y,
                }
              : null
          }
          gradientColors={['#dbeafe', '#60a5fa']}
          onBack={() => navigation.goBack()}
          onMenuPress={handleMenuPress}
        >
          <View style={styles.heroBadgeRow}>
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusBadgeActive : styles.statusBadgeEnded,
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {isActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{link.name}</Text>
          <Text style={styles.heroSubtitle}>
            Created by {owner?.name ?? 'Unknown'}
          </Text>
        </HeroBanner>

        <View style={styles.contentArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 160 }}
            refreshControl={
              <RefreshControl
                refreshing={linkLoading}
                onRefresh={refetchLink}
              />
            }
          >
            <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
              {/* Time info */}
              <View style={styles.infoRow}>
                <Feather name="calendar" size={14} color="#64748b" />
                <Text style={styles.infoText}>
                  {isActive
                    ? `Started ${startFormatted.date} at ${startFormatted.time}`
                    : `${startFormatted.date} — ${endFormatted.date}`}
                </Text>
              </View>
              <View style={[styles.infoRow, { marginBottom: 12 }]}>
                <Feather name="clock" size={14} color="#64748b" />
                <Text style={styles.infoText}>
                  {isActive
                    ? `Active for ${formatDuration(link.created_at, null)}`
                    : `Lasted ${formatDuration(link.created_at, link.end_time)}`}
                </Text>
              </View>

              {/* Members row */}
              <View style={[styles.membersRow, { marginBottom: 12 }]}>
                <AvatarStack avatarUris={memberAvatars} size={32} />
                <Text style={styles.infoText}>
                  {link.members.length} member
                  {link.members.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <CardSection>
                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{link.postCount}</Text>
                    <Text style={styles.statLabel}>
                      Post{link.postCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{link.mediaCount}</Text>
                    <Text style={styles.statLabel}>
                      Item{link.mediaCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </CardSection>
            </Card>

            <Divider style={{ marginVertical: 24 }} />

            {/* All Items Section */}
            <View style={styles.section}>
              <SectionHeader
                title="All Items"
                count={link.mediaCount}
                action={
                  link.mediaCount > 6 ? (
                    <Pressable onPress={handleSeeAllMedia}>
                      <View style={styles.seeAllRow}>
                        <Text style={styles.seeAllText}>See all</Text>
                        <Feather
                          name="chevron-right"
                          size={16}
                          color="#2563eb"
                        />
                      </View>
                    </Pressable>
                  ) : undefined
                }
              />

              {link.mediaCount === 0 ? (
                <EmptyState
                  icon="image"
                  title="No media yet"
                  message={
                    isActive
                      ? 'Media from all posts will appear here'
                      : 'No media were added to this link'
                  }
                />
              ) : (
                <MediaGrid
                  media={allMedia}
                  onMediaPress={handleMediaPress}
                  maxItems={6}
                  scrollEnabled={false}
                  onOverflowPress={handleSeeAllMedia}
                />
              )}
            </View>

            <Divider style={{ marginVertical: 24 }} />

            {/* Post Feed Section */}
            <View style={styles.section}>
              <SectionHeader title="Posts" count={link.postCount} />

              {link.postCount === 0 ? (
                <EmptyState
                  icon="camera"
                  title="No posts yet"
                  message={
                    isActive
                      ? 'Be the first to share!'
                      : 'No media were shared in this link'
                  }
                />
              ) : (
                link.posts.map((post) => (
                  <PostFeedItem
                    key={post.id}
                    post={post}
                    onMediaPress={handleMediaPress}
                    currentUserId={userId}
                    onDeletePost={linkActions.deletePost}
                  />
                ))
              )}
            </View>

            <Divider style={{ marginVertical: 24 }} />
          </ScrollView>

          {/* Bottom Actions (for active links) */}
          {isActive && isMember && (
            <>
              {hasAssets && (
                <StagedMediaSheet
                  assets={stagedAssets}
                  onAddFromGallery={addFromGallery}
                  onRemove={removeAsset}
                  onClearAll={clearAll}
                  onUpload={uploadAll}
                  uploading={uploading}
                />
              )}
            </>
          )}

          {/* Dropdown Menu */}
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

          {/* Edit Link Name Modal */}
          <CreateLinkModal
            visible={editModalVisible}
            initialName={link?.name ?? ''}
            onClose={() => setEditModalVisible(false)}
            onSubmit={handleEditName}
          />

          <EditLinkBannerModal
            visible={editBannerVisible}
            onClose={() => setEditBannerVisible(false)}
            images={imageMedia}
            initialPath={link.banner_path}
            saving={linkActions.savingBanner}
            onSave={handleSaveBanner}
          />

          <UploadProgressModal visible={uploading} progress={progress} />
        </View>
      </View>
      <CameraModal
        visible={!!cameraMode}
        initialMode={cameraMode ?? 'photo'}
        onCapture={(assets) => {
          stageAssets(assets);
          setCameraMode(null);
        }}
        onClose={() => setCameraMode(null)}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(34,197,94,0.8)',
  },
  statusBadgeEnded: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textInverse,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.xs,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPlaceholder,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.borderLight,
    alignSelf: 'stretch',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
  },
}));
