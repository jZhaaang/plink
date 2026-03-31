import { ComponentProps, useCallback, useMemo, useState } from 'react';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  View,
  Text,
  Pressable,
  RefreshControl,
  GestureResponderEvent,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  PartyStackParamList,
  SignedInParamList,
} from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import { useLinkDetailActions } from '../hooks/useLinkDetailActions';
import PostCard from '../components/PostCard';
import {
  EmptyState,
  Divider,
  SectionHeader,
  DropdownMenu,
  DropdownMenuItem,
  Card,
  CardSection,
  LoadingScreen,
  DataFallbackScreen,
  AvatarStack,
  AnimatedListItem,
  MediaGrid,
  HeroBanner,
  UploadProgressModal,
  Spinner,
} from '../../../components';
import { useStagedMediaActions } from '../hooks/useStagedMediaActions';
import StagedMediaSheet from '../components/StagedMediaSheet';
import { formatDateTime, formatDuration } from '../../../lib/utils/formatTime';
import { useActiveLinkContext } from '../../../providers/ActiveLinkProvider';
import { StatusBar } from 'expo-status-bar';
import { LinkPostMedia } from '../../../lib/models';
import CameraModal from '../components/CameraModal';
import {
  StackActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useAuth } from '../../../providers/AuthProvider';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useThumbnailSubscription } from '../hooks/useThumbnailSubscription';
import JoinLinkBanner from '../components/JoinLinkBanner';
import { useLinkPosts } from '../hooks/useLinkPosts';
import EditLinkModal, { EditLinkChanges } from '../components/EditLinkModal';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId, partyId } = route.params;
  const { userId } = useAuth();
  const rootNav = useNavigation<NativeStackNavigationProp<SignedInParamList>>();
  const { theme } = useUnistyles();

  const {
    linkDetail,
    loading: linkLoading,
    error: linkError,
    refetch: refetchLink,
  } = useLinkDetail(linkId);

  const {
    posts,
    allMedia,
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLinkPosts(linkId);

  const linkActions = useLinkDetailActions({
    linkId,
    partyId,
    linkDetail,
    posts,
    onDelete: () => {
      const state = navigation.getState();
      const isStackRoot = state.index === 0;

      if (!isStackRoot) {
        navigation.dispatch(StackActions.pop());
      } else {
        navigation.getParent()?.navigate('Party', {
          screen: 'PartyDetail',
          params: { partyId },
        });
      }
    },
    onLeave: () => navigation.goBack(),
  });

  const { uploadAction, clearUploadAction } = useActiveLinkContext();

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
    pendingMediaIds,
    clearPendingMediaIds,
  } = useStagedMediaActions({
    linkId,
    partyId,
    userId,
  });
  useThumbnailSubscription(linkId, pendingMediaIds, clearPendingMediaIds);

  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

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
  if (linkError || !linkDetail)
    return <DataFallbackScreen onAction={refetchLink} />;

  const startFormatted = formatDateTime(linkDetail.created_at);
  const endFormatted = formatDateTime(linkDetail.end_time);
  const isActive = linkDetail && !linkDetail.end_time;
  const isOwner = linkDetail.owner_id === userId;
  const isMember = linkDetail.members.some((m) => m.id === userId) ?? false;
  const memberAvatars = linkDetail.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);
  const owner = linkDetail.members.find((m) => m.id === linkDetail.owner_id);

  const handleMediaPress = (item: LinkPostMedia) => {
    const index = allMedia.findIndex((m) => m.id === item.id);
    rootNav.navigate('MediaViewer', {
      linkId,
      initialIndex: index === -1 ? 0 : index,
    });
  };

  const handleSeeAllMedia = () => {
    rootNav.navigate('AllMedia', { linkId });
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
      label: 'Edit Link',
      action: () => {
        setMenuVisible(false);
        setEditModalVisible(true);
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

  const handleEditSave = async (changes: EditLinkChanges) => {
    await linkActions.editLink(changes);
    setEditModalVisible(false);
  };

  return (
    <>
      <View style={styles.root}>
        <StatusBar style="light" />

        <HeroBanner
          variant="default"
          bannerUri={linkDetail.bannerUrl ?? null}
          emptyHint="Add a photo to set a banner"
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
          <Text style={styles.heroTitle}>{linkDetail.name}</Text>
          <Text style={styles.heroSubtitle}>
            {linkDetail.members.length}{' '}
            {linkDetail.members.length === 1 ? 'member' : 'members'}
          </Text>
        </HeroBanner>

        <View style={styles.contentArea}>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={linkLoading}
                onRefresh={() => {
                  refetchLink();
                  refetchPosts();
                }}
              />
            }
            contentContainerStyle={styles.container}
            ListHeaderComponent={
              <>
                {/* Info Card */}
                <Card>
                  <CardSection>
                    {/* Time info */}
                    <View style={styles.infoRow}>
                      <Feather
                        name="calendar"
                        size={theme.iconSizes.sm}
                        color={theme.colors.gray}
                      />
                      <Text style={styles.infoText}>
                        {isActive
                          ? `Started ${startFormatted.date} at ${startFormatted.time}`
                          : `${startFormatted.date} — ${endFormatted.date}`}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Feather
                        name="clock"
                        size={theme.iconSizes.sm}
                        color={theme.colors.gray}
                      />
                      <Text style={styles.infoText}>
                        {isActive
                          ? `Active for ${formatDuration(linkDetail.created_at, null)}`
                          : `Lasted ${formatDuration(linkDetail.created_at, linkDetail.end_time)}`}
                      </Text>
                    </View>
                    {linkDetail.locations.length > 0 && (
                      <View
                        style={[styles.infoRow, { alignItems: 'flex-start' }]}
                      >
                        <Feather
                          name="map-pin"
                          size={theme.iconSizes.sm}
                          color={theme.colors.gray}
                        />
                        <View style={{ flex: 1 }}>
                          {linkDetail.locations.map((location) => (
                            <Text key={location.id} style={styles.infoText}>
                              {location.name}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Members row */}
                    <View style={[styles.membersRow]}>
                      <AvatarStack
                        avatarUris={memberAvatars}
                        size={theme.avatarSizes.sm}
                      />
                      <Text style={styles.infoText}>
                        Created by {owner?.name}
                      </Text>
                    </View>

                    <Divider style={{ marginVertical: theme.spacing.sm }} />

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {linkDetail.postCount}
                        </Text>
                        <Text style={styles.statLabel}>
                          Post{linkDetail.postCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {linkDetail.mediaCount}
                        </Text>
                        <Text style={styles.statLabel}>
                          Item{linkDetail.mediaCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </CardSection>
                </Card>

                <Divider style={{ marginVertical: theme.spacing['2xl'] }} />

                {/* All Items Section */}
                <SectionHeader
                  title="All Items"
                  count={linkDetail.mediaCount}
                  action={
                    linkDetail.mediaCount > 6 ? (
                      <Pressable onPress={handleSeeAllMedia}>
                        <View style={styles.seeAllRow}>
                          <Text style={styles.seeAllText}>See all</Text>
                          <Feather
                            name="chevron-right"
                            size={theme.iconSizes.sm}
                            color={theme.colors.primary}
                          />
                        </View>
                      </Pressable>
                    ) : undefined
                  }
                />

                {postsError ? (
                  <DataFallbackScreen onAction={refetchPosts} />
                ) : postsLoading ? (
                  <Spinner style={{ paddingVertical: theme.spacing.xl }} />
                ) : allMedia.length === 0 ? (
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

                <Divider style={{ marginVertical: theme.spacing['2xl'] }} />

                {/* Post Feed Section */}
                <SectionHeader title="Posts" count={linkDetail.postCount} />
              </>
            }
            renderItem={({ item, index }) => (
              <AnimatedListItem index={index}>
                <PostCard
                  post={item}
                  onMediaPress={handleMediaPress}
                  currentUserId={userId}
                  onDeletePost={linkActions.deletePost}
                />
              </AnimatedListItem>
            )}
            ListEmptyComponent={
              postsError ? (
                <DataFallbackScreen onAction={refetchPosts} />
              ) : postsLoading ? (
                <Spinner style={{ paddingVertical: theme.spacing.xl }} />
              ) : (
                <EmptyState
                  icon="camera"
                  title="No posts yet"
                  message={
                    isActive
                      ? 'Be the first to share!'
                      : 'No media was shared in this link'
                  }
                />
              )
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <Spinner style={{ paddingVertical: theme.spacing.xl }} />
              ) : null
            }
          />

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

          {isActive && !isMember && (
            <JoinLinkBanner
              onJoin={linkActions.joinLink}
              memberCount={linkDetail.members.length}
            />
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

          <EditLinkModal
            visible={editModalVisible}
            link={linkDetail}
            images={imageMedia}
            saving={linkActions.savingBanner}
            onClose={() => setEditModalVisible(false)}
            onSave={handleEditSave}
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
    backgroundColor: theme.colors.badgeActive,
  },
  statusBadgeEnded: {
    backgroundColor: theme.colors.badgeInactive,
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
    color: theme.colors.textInverseMuted,
  },
  contentArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
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
    fontSize: theme.fontSizes.xs,
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
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPlaceholder,
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
