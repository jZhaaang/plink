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
import { useDialog } from '../../../providers/DialogProvider';
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
import HeroBanner from '../../../components/HeroBanner';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId, partyId } = route.params;
  const { userId } = useAuth();
  const dialog = useDialog();

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

  const onUploadError = useCallback(
    (error: unknown) => {
      dialog.error('Upload Failed', getErrorMessage(error));
    },
    [dialog],
  );

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

  const [cameraMode, setCameraMode] = useState<'picture' | 'video' | null>(
    null,
  );
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
          setCameraMode('picture');
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

  /* -----------------------
      Navigation Handlers
     -----------------------*/

  const handlePostMediaPress = (index: number) => {
    navigation.navigate('MediaViewer', { linkId, initialIndex: index });
  };

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

  /* -----------------------
      Dropdown Menu
     -----------------------*/

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
      <View className="flex-1 bg-neutral-50">
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
          <View className="flex-row items-center mb-1">
            <View
              className={`px-2.5 py-0.5 rounded-full ${isActive ? 'bg-green-500/80' : 'bg-white/20'}`}
            >
              <Text className="text-xs font-semibold text-white">
                {isActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-white">{link.name}</Text>
          <Text className="text-sm text-white/70 mt-0.5">
            Created by {owner.name ?? 'Unknown'}
          </Text>
        </HeroBanner>

        <View className="flex-1 bg-neutral-50">
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-40"
            refreshControl={
              <RefreshControl
                refreshing={linkLoading}
                onRefresh={refetchLink}
              />
            }
          >
            <Card className="mx-4 mt-4">
              {/* Time info */}
              <View className="flex-row items-center mb-2">
                <Feather name="calendar" size={14} color="#64748b" />
                <Text className="text-sm text-slate-500 ml-2">
                  {isActive
                    ? `Started ${startFormatted.date} at ${startFormatted.time}`
                    : `${startFormatted.date} — ${endFormatted.date}`}
                </Text>
              </View>
              <View className="flex-row items-center mb-3">
                <Feather name="clock" size={14} color="#64748b" />
                <Text className="text-sm text-slate-500 ml-2">
                  {isActive
                    ? `Active for ${formatDuration(link.created_at, null)}`
                    : `Lasted ${formatDuration(link.created_at, link.end_time)}`}
                </Text>
              </View>

              {/* Members row */}
              <View className="flex-row items-center justify-between mb-3">
                <AvatarStack avatarUris={memberAvatars} size={32} />
                <Text className="text-sm text-slate-500">
                  {link.members.length} member
                  {link.members.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <CardSection>
                {/* Stats row */}
                <View className="flex-row justify-around pt-1">
                  <View className="items-center">
                    <Text className="text-xl font-bold text-slate-800">
                      {link.postCount}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">Posts</Text>
                  </View>
                  <View className="w-px bg-slate-100 self-stretch" />
                  <View className="items-center">
                    <Text className="text-xl font-bold text-slate-800">
                      {link.mediaCount}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">Media</Text>
                  </View>
                </View>
              </CardSection>
            </Card>

            <Divider className="my-6" />

            {/* All Photos Section */}
            <View className="px-4 pb-8">
              <SectionHeader
                title="All Media"
                count={link.mediaCount}
                action={
                  link.mediaCount > 6 ? (
                    <Pressable
                      onPress={handleSeeAllMedia}
                      className="flex-row items-center"
                    >
                      <Text className="text-blue-600 text-sm font-medium">
                        See all
                      </Text>
                      <Feather name="chevron-right" size={16} color="#2563eb" />
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

            <Divider className="my-6" />

            {/* Post Feed Section */}
            <View className="px-4">
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
                    onMediaPress={handlePostMediaPress}
                    currentUserId={userId}
                    onDeletePost={linkActions.deletePost}
                  />
                ))
              )}
            </View>

            <Divider className="my-6" />
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
        initial={cameraMode}
        onCapture={(assets) => {
          stageAssets(assets);
          setCameraMode(null);
        }}
        onClose={() => setCameraMode(null)}
      />
    </>
  );
}
