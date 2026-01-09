import { useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { PartyStackParamList } from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import { useMediaUpload } from '../hooks/useMediaUpload';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { useDialog } from '../../../providers/DialogProvider';
import { endLink } from '../../../lib/supabase/queries/links';
import AvatarStack from '../../../components/AvatarStack';
import MediaGrid from '../components/MediaGrid';
import PostFeedItem from '../components/PostFeedItem';
import {
  Button,
  EmptyState,
  Divider,
  SectionHeader,
} from '../../../components';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId } = route.params;
  const { session } = useAuth();
  const userId = session?.user?.id;
  const dialog = useDialog();

  const { link, loading, error, refetch } = useLinkDetail(linkId);

  const { pickAndUpload, uploading } = useMediaUpload({
    linkId,
    userId: userId ?? '',
    onSuccess: refetch,
    onError: (err) => dialog.error('Upload failed', err.message),
  });

  const isActive = link && !link.end_time;
  const isOwner = link?.owner_id === userId;

  const allMedia = useMemo(() => {
    if (!link) return [];
    return link.posts.flatMap((post) => post.media);
  }, [link]);

  const mediaUrls = useMemo(() => allMedia.map((m) => m.url), [allMedia]);

  const handleEndLink = async () => {
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

  const handlePostMediaPress = (postMediaUrls: string[], index: number) => {
    navigation.navigate('MediaViewer', {
      mediaUrls: postMediaUrls,
      initialIndex: index,
    });
  };

  const handleAllMediaPress = (index: number) => {
    navigation.navigate('MediaViewer', { mediaUrls, initialIndex: index });
  };

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

  const memberAvatars = link.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);

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
        <View className="w-10" />
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
        <View className="px-4 mt-4">
          <Text className="text-sm text-slate-500">
            {isActive
              ? `Started ${formatDate(link.created_at)}`
              : `${formatDate(link.created_at)} - ${formatDate(link.end_time)}`}
          </Text>

          <View className="flex-row items-center mt-3">
            <AvatarStack avatarUris={memberAvatars} size={36} />
            <Text className="text-sm text-slate-500 ml-2">
              {link.members.length} member{link.members.length !== 1 ? 's' : ''}
            </Text>
          </View>
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
              />
            ))
          )}
        </View>

        <Divider className="my-6" />

        {/* All Photos Section */}
        <View className="px-4 pb-8">
          <SectionHeader title="All Photos" count={link.mediaCount} />

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
            <MediaGrid media={allMedia} onMediaPress={handleAllMediaPress} />
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions (for active links) */}
      {isActive && (
        <View className="px-4 py-4 border-t border-slate-200 bg-white">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title={uploading ? 'Uploading...' : 'Add Photos'}
                size="lg"
                onPress={pickAndUpload}
                loading={uploading}
                disabled={uploading}
              />
            </View>
            {isOwner && (
              <Button
                title="End"
                variant="outline"
                size="lg"
                onPress={handleEndLink}
              />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
