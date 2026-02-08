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
import { Feather, Ionicons } from '@expo/vector-icons';
import { PartyStackParamList } from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
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
} from '../../../components';
import { useStagedMedia } from '../hooks/useStagedMedia';
import { StagedPhotosPreview } from '../components/StagedPhotosPreview';
import UploadProgressModal from '../../../components/UploadProgressModal';
import { links } from '../../../lib/supabase/storage/links';
import { deleteLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';
import { deleteLinkPost } from '../../../lib/supabase/queries/linkPosts';
import { formatDateTime, formatDuration } from '../../../lib/utils/formatTime';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId, partyId } = route.params;
  const { session } = useAuth();
  const userId = session?.user?.id;
  const dialog = useDialog();

  const { link, loading, error, refetch } = useLinkDetail(linkId);

  const {
    stagedAssets,
    addFromGallery,
    addFromCamera,
    removeAsset,
    uploadAll,
    uploading,
    progress,
    hasAssets,
  } = useStagedMedia({
    linkId,
    userId,
    onSuccess: refetch,
    onError: (error) => dialog.error('Upload failed', error.message),
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);

  const allMedia = useMemo(() => {
    if (!link) return [];
    return link.posts.flatMap((post) => post.media);
  }, [link]);

  const mediaUrls = useMemo(() => allMedia.map((m) => m.url), [allMedia]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !link) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6 bg-neutral-50">
        <Text className="text-center text-neutral-600 mb-4">
          Failed to load link details.
        </Text>
        <Button title="Retry" variant="outline" onPress={refetch} />
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
      'This will end the link. Members can still view photos but cannot add new ones.',
    );

    if (!confirmed) return;

    try {
      await endLink(linkId);
      refetch();
    } catch (err) {
      await dialog.error('Error ending link', err.message);
    }
  };

  const handleEditName = async (newName: string) => {
    try {
      await updateLinkById(linkId, { name: newName });
      setEditModalVisible(false);
      refetch();
    } catch (err) {
      await dialog.error('Error updating link', err.message);
    }
  };

  const handleDeleteLink = async () => {
    setMenuVisible(false);
    const confirmed = await dialog.confirmDanger(
      'Delete Link?',
      'This will permanently delete the link and all its photos. This cannot be undone.',
    );

    if (!confirmed) return;

    try {
      await deleteLink(linkId);
      navigation.navigate('PartyDetail', { partyId });
    } catch (err) {
      await dialog.error('Error deleting link', err.message);
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
      refetch();
    } catch (err) {
      await dialog.error('Error joining link', err.message);
    }
  };

  const handleLeaveLink = async () => {
    setMenuVisible(false);
    const confirmed = await dialog.confirmDanger(
      'Leave Link?',
      'You will no longer be able to view or add photos to this link.',
    );

    if (!confirmed) return;

    if (!userId) return;

    try {
      await deleteLinkMember(linkId, userId);
      navigation.goBack();
    } catch (err) {
      await dialog.error('Error leaving link', err.message);
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

  const handlePostMediaPress = (postMediaUrls: string[], index: number) => {
    navigation.navigate('MediaViewer', {
      mediaUrls: postMediaUrls,
      initialIndex: index,
    });
  };

  const handleMediaPress = (index: number) => {
    navigation.navigate('MediaViewer', { mediaUrls, initialIndex: index });
  };

  const handleSeeAllMedia = () => {
    navigation.navigate('AllMedia', { linkId });
  };

  const handleDeletePost = async (postId: string) => {
    const post = link?.posts.find((p) => p.id === postId);
    if (!post) return;

    const confirmed = await dialog.confirmDanger(
      'Delete Post?',
      `This will permanently delete this post and ${post.media.length} photo${post.media.length !== 1 ? 's' : ''}.`,
    );

    if (!confirmed) return;

    try {
      await links.remove(post.media.map((media) => media.path));
      await Promise.all(post.media.map((media) => deleteLinkPostMedia(media.id)));

      await deleteLinkPost(postId);
      refetch();
    } catch (err) {
      dialog.error('Delete failed', err.message);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#333" />
        </Pressable>
        <Text
          className="flex-1 text-lg font-semibold text-center"
          numberOfLines={1}
        >
          {link.name}
        </Text>
        <Pressable onPress={handleMenuPress} className="p-2 -mr-2">
          <Feather name="more-vertical" size={24} color="#333" />
        </Pressable>
      </View>

      {/* Status Banner */}
      <View
        className={`mx-4 px-4 py-2 rounded-lg ${
          isActive ? 'bg-green-100' : 'bg-slate-100'
        }`}
      >
        <Text
          className={`text-center font-medium ${
            isActive ? 'text-green-700' : 'text-slate-600'
          }`}
        >
          {isActive ? 'Active' : 'Ended'}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Link Info */}
        <View className="px-4 mt-4 gap-2">
          {/* Owner */}
          <Text className="text-sm text-slate-500">
            Created by {owner.name}
          </Text>
          {/* Primary timestamp */}
          <Text className="text-sm text-slate-500">
            {isActive
              ? `Started ${startFormatted.date} at ${startFormatted.time}`
              : `${startFormatted.date}, ${startFormatted.time} - ${endFormatted.date}, ${endFormatted.time}`}
          </Text>

          {/* Duration badge */}
          <View className="flex-row items-center">
            <Feather name="clock" size={14} color="#64748b" />
            <Text className="text-sm text-slate-500 ml-1">
              {isActive
                ? `Active for ${formatDuration(link.created_at, null)}`
                : `Lasted ${formatDuration(link.created_at, link.end_time)}`}
            </Text>
          </View>

          {/* Members */}
          <View className="flex-row items-center mt-2">
            <AvatarStack avatarUris={memberAvatars} size={36} />
            <Text className="text-sm text-slate-500 ml-2">
              {link.members.length} member{link.members.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Stats row */}
          <View className="flex-row justify-around mt-2 py-3 bg-slate-50 rounded-xl">
            <View className="items-center">
              <Text className="text-lg font-semibold text-slate-800">
                {link.postCount}
              </Text>
              <Text className="text-xs text-slate-500">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-semibold text-slate-800">
                {link.mediaCount}
              </Text>
              <Text className="text-xs text-slate-500">Photos</Text>
            </View>
          </View>
        </View>

        <Divider className="my-6" />

        {/* All Photos Section */}
        <View className="px-4 pb-8">
          <SectionHeader
            title="All Photos"
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
              title="No photos yet"
              message={
                isActive
                  ? 'Photos from all posts will appear here'
                  : 'No photos were added to this link'
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
                  ? 'Be the first to share a photo!'
                  : 'No photos were shared in this link'
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
          <StagedPhotosPreview assets={stagedAssets} onRemove={removeAsset} />
          <View className="px-4 py-4 border-t border-slate-200 bg-white">
            <View className="flex-row gap-3">
              {/* Camera button */}
              <Pressable
                onPress={addFromCamera}
                disabled={uploading}
                className="flex-1 bg-slate-100 rounded-xl py-4 items-center"
              >
                <Ionicons name="camera" size={24} color="#334155" />
                <Text className="text-slate-700 mt-1 font-medium">Camera</Text>
              </Pressable>

              {/* Upload button */}
              <Pressable
                onPress={addFromGallery}
                disabled={uploading}
                className="flex-1 bg-blue-100 rounded-xl py-4 items-center"
              >
                <Ionicons name="images" size={24} color="#6366f1" />
                <Text className="text-primary-600 mt-1 font-medium">
                  Gallery
                </Text>
              </Pressable>

              {/* Post button */}
              <Pressable
                onPress={uploadAll}
                disabled={uploading || !hasAssets}
                className={`rounded-xl px-5 py-3 items-center justify-center active:opacity-80 disabled:opacity-40 ${hasAssets ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={24}
                    color={hasAssets ? 'white' : '#94a3b8'}
                  />
                )}
              </Pressable>
            </View>
          </View>
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

      <UploadProgressModal visible={uploading} progress={progress} />
    </SafeAreaView>
  );
}
