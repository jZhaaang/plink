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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { PartyStackParamList } from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import { useDialog } from '../../../providers/DialogProvider';
import {
  endLink,
  deleteLink,
  updateLinkById,
} from '../../../lib/supabase/queries/links';
import {
  createLinkMember,
  deleteLinkMember,
} from '../../../lib/supabase/queries/linkMembers';
import AvatarStack from '../../../components/AvatarStack';
import MediaGrid from '../components/MediaGrid';
import PostFeedItem from '../components/PostFeedItem';
import CreateLinkModal from '../components/CreateLinkModal';
import {
  Button,
  EmptyState,
  Divider,
  SectionHeader,
  DropdownMenu,
  DropdownMenuItem,
  Card,
  LoadingScreen,
} from '../../../components';
import { useStagedMedia } from '../hooks/useStagedMedia';
import StagedMediaSheet from '../components/StagedMediaSheet';
import UploadProgressModal from '../../../components/UploadProgressModal';
import { links as linksStorage } from '../../../lib/supabase/storage/links';
import { deleteLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';
import { deleteLinkPost } from '../../../lib/supabase/queries/linkPosts';
import { formatDateTime, formatDuration } from '../../../lib/utils/formatTime';
import { useActiveLinkContext } from '../../../providers/ActiveLinkProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { CardSection } from '../../../components/Card';
import { StatusBar } from 'expo-status-bar';
import { LinkPostMedia } from '../../../lib/models';
import CameraModal from '../components/CameraModal';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import EditLinkBannerModal from '../components/EditLinkBannerModal';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { compressImage } from '../../../lib/media/compress';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId, partyId } = route.params;
  const { userId } = useAuth();
  const dialog = useDialog();
  const invalidate = useInvalidate();

  const { link, loading, error, refetch } = useLinkDetail(linkId);

  const onUploadSuccess = useCallback(() => {
    invalidate.linkDetail(linkId);
  }, [invalidate, linkId]);

  const onUploadError = useCallback(
    (error: Error) => {
      dialog.error('Upload failed', error.message);
    },
    [dialog],
  );

  const onUploadComplete = useCallback(
    async (uploaded: { type: string; path: string }[]) => {
      if (link?.banner_path) return;
      const firstImage = uploaded.find((item) => item.type === 'image');
      if (!firstImage) return;
      await updateLinkById(linkId, {
        banner_path: firstImage.path,
        banner_crop_x: 50,
        banner_crop_y: 42,
      });
      invalidate.linkDetail(linkId);
      invalidate.partyDetail(partyId);
    },
    [link?.banner_path, linkId, partyId, invalidate],
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
    userId,
    onSuccess: onUploadSuccess,
    onError: onUploadError,
    onUploadComplete,
  });

  const [showCamera, setShowCamera] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editBannerVisible, setEditBannerVisible] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  const insets = useSafeAreaInsets();

  const allMedia = useMemo(() => {
    if (!link) return [];
    return link.posts.flatMap((post) => post.media);
  }, [link]);
  const imageMedia = useMemo(
    () => allMedia.filter((media) => media.type === 'image'),
    [allMedia],
  );

  const { uploadRequested, clearUploadRequest } = useActiveLinkContext();

  useFocusEffect(
    useCallback(() => {
      if (uploadRequested) {
        clearUploadRequest();
        setShowCamera(true);
      }
    }, [uploadRequested, clearUploadRequest]),
  );

  if (loading) return <LoadingScreen label="Loading..." />;

  if (error || !link) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6 bg-neutral-50">
        <Text className="text-center text-neutral-600 mb-4">
          Failed to load link details.
        </Text>
        <Text className="text-center text-xs text-red-500 mb-4">
          {error?.message}
        </Text>
        <Button title="Retry" variant="outline" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  const startFormatted = formatDateTime(link.created_at);
  const endFormatted = formatDateTime(link.end_time);
  const isActive = link && !link.end_time;
  const isOwner = link.owner_id === userId;
  const isMember = link.members.some((m) => m.id === userId) ?? false;
  const memberAvatars = link.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);
  const owner = link.members.find((m) => m.id === link.owner_id);

  const handleEndLink = async () => {
    setMenuVisible(false);
    const confirmed = await dialog.confirmDanger(
      'End Link?',
      'This will end the link. Members can still view media but cannot add more.',
    );

    if (!confirmed) return;

    try {
      await endLink(linkId);
      trackEvent('link_ended', { link_id: linkId });
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
      invalidate.activity();
    } catch (err) {
      await dialog.error('Error ending link', getErrorMessage(err));
    }
  };

  const handleEditName = async (newName: string) => {
    try {
      await updateLinkById(linkId, { name: newName });
      setEditModalVisible(false);
      trackEvent('link_updated', { link_id: linkId });
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
      invalidate.activity();
    } catch (err) {
      await dialog.error('Error updating link', getErrorMessage(err));
    }
  };

  const handleDeleteLink = async () => {
    setMenuVisible(false);
    const confirmed = await dialog.confirmDanger(
      'Delete Link?',
      'This will permanently delete the link and all its media. This cannot be undone.',
    );

    if (!confirmed) return;

    try {
      const linkPaths = await linksStorage.getPathsById(linkId);
      await linksStorage.remove(linkPaths);
      await deleteLink(linkId);
      trackEvent('link_deleted', { link_id: linkId });
      trackEvent('link_post_deleted', {
        link_id: linkId,
        posts_count: link.posts.length,
      });
      trackEvent('media_deleted', {
        link_id: linkId,
        media_count: linkPaths.length,
      });
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
      invalidate.activity();
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
    } catch (err) {
      await dialog.error('Error deleting link', getErrorMessage(err));
    }
  };

  const handleJoinLink = async () => {
    setMenuVisible(false);
    const confirmed = await dialog.confirmAsk(
      'Join Link?',
      'Become an active participant in the ongoing link.',
    );

    if (!confirmed) return;

    try {
      await createLinkMember({ link_id: linkId, user_id: userId });
      trackEvent('link_joined', { link_id: linkId });
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
    } catch (err) {
      await dialog.error('Error joining link', getErrorMessage(err));
    }
  };

  const handleLeaveLink = async () => {
    setMenuVisible(false);
    const confirmed = await dialog.confirmDanger(
      'Leave Link?',
      'You will no longer be able to view or add media to this link.',
    );

    if (!confirmed) return;

    if (!userId) return;

    try {
      await deleteLinkMember(linkId, userId);
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
      navigation.goBack();
    } catch (err) {
      await dialog.error('Error leaving link', getErrorMessage(err));
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
        action: handleEndLink,
      });
    }

    menuItems.push({
      icon: 'trash-2',
      label: 'Delete Link',
      action: handleDeleteLink,
      variant: 'danger',
    });
  } else if (isMember) {
    menuItems.push({
      icon: 'log-out',
      label: 'Leave Link',
      action: handleLeaveLink,
      variant: 'danger',
    });
  } else if (isActive) {
    menuItems.push({
      icon: 'log-in',
      label: 'Join Link',
      action: handleJoinLink,
    });
  }

  const handlePostMediaPress = (
    postMediaItems: LinkPostMedia[],
    index: number,
  ) => {
    navigation.navigate('MediaViewer', {
      linkId,
      initialIndex: index,
    });
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

  const handleDeletePost = async (postId: string) => {
    const post = link?.posts.find((p) => p.id === postId);
    if (!post) return;

    const confirmed = await dialog.confirmDanger(
      'Delete Post?',
      `This will permanently delete this post and ${post.media.length} media.`,
    );

    if (!confirmed) return;

    try {
      const deletedPaths = new Set(post.media.map((media) => media.path));
      const isDeletingBanner =
        !!link.banner_path && deletedPaths.has(link.banner_path);
      const nextImageBanner = isDeletingBanner
        ? allMedia.find(
            (media) => media.type === 'image' && !deletedPaths.has(media.path),
          )
        : null;

      await Promise.all(
        post.media.map((media) => deleteLinkPostMedia(media.id)),
      );
      await deleteLinkPost(postId);
      await linksStorage.remove(post.media.map((media) => media.path));

      if (isDeletingBanner) {
        await updateLinkById(linkId, {
          banner_path: nextImageBanner?.path ?? null,
          banner_crop_x: 50,
          banner_crop_y: 42,
        });
      }

      invalidate.linkDetail(linkId);
    } catch (err) {
      dialog.error('Delete failed', getErrorMessage(err));
    }
  };

  const handleSaveBanner = async (croppedUri: string) => {
    setSavingBanner(true);
    try {
      const compressed = await compressImage(croppedUri);
      const bannerPath = await linksStorage.uploadBanner(
        linkId,
        compressed.uri,
        'image/jpeg',
      );
      await updateLinkById(linkId, {
        banner_path: bannerPath,
        banner_crop_x: 50,
        banner_crop_y: 42,
      });
      setEditBannerVisible(false);
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
    } catch (err) {
      await dialog.error('Error updating banner', getErrorMessage(err));
    } finally {
      setSavingBanner(false);
    }
  };

  return (
    <>
      <View className="flex-1 bg-neutral-50">
        <StatusBar style="light" />
        <View style={{ height: insets.top, overflow: 'hidden' }}>
          {link.bannerUrl ? (
            <>
              <Image
                source={{ uri: link.bannerUrl }}
                cachePolicy="memory-disk"
                contentFit="cover"
                contentPosition={{
                  left: `${link.banner_crop_x}%`,
                  top: `${link.banner_crop_y}%`,
                }}
                blurRadius={20}
                style={{ width: '100%', height: insets.top + 40 }}
              />
              <View className="absolute inset-0 bg-black/25" />
            </>
          ) : (
            <LinearGradient
              colors={['#dbeafe', '#60a5fa']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{ width: '100%', height: insets.top + 40 }}
            />
          )}
        </View>
        <View className="flex-1 bg-neutral-50">
          {/* Hero */}
          <View className="w-full" style={{ aspectRatio: 2.5 }}>
            {link.bannerUrl ? (
              <Image
                source={{ uri: link.bannerUrl }}
                cachePolicy="memory-disk"
                contentFit="cover"
                contentPosition={{
                  left: `${link.banner_crop_x}%`,
                  top: `${link.banner_crop_y}%`,
                }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <LinearGradient
                colors={['#dbeafe', '#60a5fa']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            )}

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              className="absolute bottom-0 left-0 right-0 h-28"
            />

            <View className="absolute bottom-0 left-0 right-0 px-5 pb-4">
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
            </View>
          </View>

          {/* Floating menu over hero */}
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
              <Pressable
                onPress={handleMenuPress}
                className="w-9 h-9 rounded-full bg-black/30 items-center justify-center"
              >
                <Feather name="more-vertical" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-40"
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refetch} />
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
                    onDeletePost={handleDeletePost}
                  />
                ))
              )}
            </View>

            <Divider className="my-6" />
          </ScrollView>

          {/* Bottom Actions (for active links) */}
          {isActive && isMember && (
            <>
              {hasAssets ? (
                <StagedMediaSheet
                  assets={stagedAssets}
                  onAddFromGallery={addFromGallery}
                  onRemove={removeAsset}
                  onClearAll={clearAll}
                  onUpload={uploadAll}
                  uploading={uploading}
                />
              ) : (
                <Pressable
                  onPress={addFromGallery}
                  className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-blue-600 items-center justify-center active:bg-blue-700"
                  style={{
                    shadowColor: '#2563eb',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Feather name="plus" size={24} color="white" />
                </Pressable>
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
            saving={savingBanner}
            onSave={handleSaveBanner}
          />

          <UploadProgressModal visible={uploading} progress={progress} />
        </View>
      </View>
      <CameraModal
        visible={showCamera}
        onCapture={(assets) => {
          stageAssets(assets);
          setShowCamera(false);
        }}
        onClose={() => setShowCamera(false)}
      />
    </>
  );
}
