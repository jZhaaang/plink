import {
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { LinkPostWithMediaResolved } from '../../../lib/models';

type Props = {
  post: LinkPostWithMediaResolved;
  onMediaPress?: (mediaUrls: string[], index: number) => void;
};

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const GAP = 2;

export default function PostFeedItem({ post, onMediaPress }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = screenWidth - 32;

  const mediaCount = post.media.length;

  const getItemSize = () => {
    if (mediaCount === 1) return contentWidth;
    if (mediaCount === 2) return (contentWidth - GAP) / 2;
    return (contentWidth - GAP * 2) / 3;
  };

  const itemSize = getItemSize();

  return (
    <View className="mb-6">
      {/* Post Header */}
      <View className="flex-row items-center mb-3">
        {post.owner.avatarUrl ? (
          <Image
            source={{ uri: post.owner.avatarUrl }}
            className="w-10 h-10 rounded-full bg-slate-200"
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
      </View>

      {/* Media Grid */}
      {mediaCount > 0 && (
        <View
          className="flex-row flex-wrap"
          style={{ gap: GAP, marginHorizontal: -GAP / 2 }}
        >
          {post.media.map((media, index) => (
            <Pressable
              key={media.id}
              onPress={() =>
                onMediaPress?.(
                  post.media.map((m) => m.url),
                  index,
                )
              }
              className="active:opacity-80"
              style={{ marginHorizontal: GAP / 2 }}
            >
              <Image
                source={{ uri: media.url }}
                style={{
                  width: itemSize,
                  height: mediaCount === 1 ? itemSize * 0.75 : itemSize,
                  borderRadius: 8,
                }}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </View>
      )}

      {/* Photo count indicator for posts with many photos */}
      {mediaCount > 0 && (
        <Text className="text-xs text-slate-500 mt-2">
          {mediaCount} photo{mediaCount !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
}
