import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  GestureResponderEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinkPostMedia, LinkPostWithMedia } from '../../../lib/models';
import { useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { DropdownMenu, DropdownMenuItem } from '../../../components';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import MediaTile from '../../../components/MediaTile';

type Props = {
  post: LinkPostWithMedia;
  onMediaPress?: (mediaItems: LinkPostMedia[], index: number) => void;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
};

const GAP = 2;

export default function PostFeedItem({
  post,
  onMediaPress,
  currentUserId,
  onDeletePost,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );

  const isPostOwner = currentUserId === post.owner_id;
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = screenWidth - 66;

  const mediaCount = post.media.length;
  const mediaItems = useMemo(() => post.media, [post.media]);

  const getItemSize = () => {
    if (mediaCount === 1) return contentWidth;
    if (mediaCount === 2) return (contentWidth - GAP) / 2;
    return (contentWidth - GAP * 2) / 3;
  };

  const itemSize = getItemSize();

  const handleMenuPress = (event: GestureResponderEvent) => {
    event.currentTarget.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setMenuAnchor({ x: x + width, y: y + height });
        setMenuVisible(true);
      },
    );
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDeletePost?.(post.id);
  };

  return (
    <View className="mb-4 bg-white rounded-2xl border border-slate-100 p-4">
      {/* Post Header */}
      <View className="flex-row items-center mb-3">
        {post.owner.avatarUrl ? (
          <Image
            source={{ uri: post.owner.avatarUrl }}
            cachePolicy="memory-disk"
            style={{ width: 40, height: 40, borderRadius: 20 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center">
            <Text className="text-slate-500 font-medium">
              {post.owner.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="font-medium text-slate-900">
            {post.owner.name ?? 'Unknown'}
          </Text>
          <Text className="text-xs text-slate-500">
            {formatRelativeTime(post.created_at)}
          </Text>
        </View>

        {isPostOwner && onDeletePost && (
          <Pressable
            onPress={handleMenuPress}
            className="p-2 -mr-2 active:bg-slate-100 rounded-full"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="more-horizontal" size={20} color="#64748b" />
          </Pressable>
        )}
      </View>

      {/* Media Grid */}
      {mediaCount > 0 && (
        <View
          className="flex-row flex-wrap"
          style={{ gap: GAP, marginHorizontal: -GAP / 2 }}
        >
          {post.media.map((media, index) => (
            <MediaTile
              key={media.id}
              uri={media.url}
              width={itemSize}
              height={mediaCount === 1 ? itemSize * 0.75 : itemSize}
              containerStyle={{ marginHorizontal: GAP / 2 }}
              onPress={() => onMediaPress?.(mediaItems, index)}
              renderOverlay={(isLoaded) => {
                if (!isLoaded || media.type !== 'video') return null;

                return (
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="w-8 h-8 rounded-full bg-black/50 items-center justify-center">
                      <Feather name="play" size={16} color="white" />
                    </View>
                  </View>
                );
              }}
            />
          ))}
        </View>
      )}

      {/* Photo count indicator for posts with many photos */}
      {mediaCount > 0 && (
        <Text className="text-xs text-slate-500 mt-2">{mediaCount} media</Text>
      )}

      <DropdownMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={menuAnchor}
      >
        <DropdownMenuItem
          icon="trash-2"
          label="Delete Post"
          onPress={handleDelete}
          variant="danger"
        />
      </DropdownMenu>
    </View>
  );
}
