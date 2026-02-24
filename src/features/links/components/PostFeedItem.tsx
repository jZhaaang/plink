import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  GestureResponderEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinkPostMedia, LinkPostWithMedia } from '../../../lib/models';
import { memo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { DropdownMenu, DropdownMenuItem } from '../../../components';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import MediaTile from '../../../components/MediaTile';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  post: LinkPostWithMedia;
  onMediaPress?: (item: LinkPostMedia) => void;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
}

const GAP = 2;

export function PostFeedItem({
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
  const contentWidth = screenWidth - 70;

  const mediaCount = post.media.length;
  const itemSize = (contentWidth - GAP * 2) / 3;

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
    <View style={styles.card}>
      {/* Post Header */}
      <View style={styles.headerRow}>
        {post.owner.avatarUrl ? (
          <Image
            source={{ uri: post.owner.avatarUrl }}
            cachePolicy="memory-disk"
            style={{ width: 40, height: 40, borderRadius: 20 }}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {post.owner.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View style={styles.headerTextWrap}>
          <Text style={styles.ownerName}>{post.owner.name ?? 'Unknown'}</Text>
          <Text style={styles.timeText}>
            {formatRelativeTime(post.created_at)}
          </Text>
        </View>

        {isPostOwner && onDeletePost && (
          <Pressable
            onPress={handleMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.menuButton}>
              <Feather name="more-horizontal" size={20} color="#64748b" />
            </View>
          </Pressable>
        )}
      </View>

      {/* Media Grid */}
      {mediaCount > 0 && (
        <View style={styles.mediaGrid}>
          {post.media.map((media) => (
            <MediaTile
              key={media.id}
              uri={media.thumbnailUrl ?? media.url}
              width={itemSize}
              height={mediaCount === 1 ? itemSize * 0.75 : itemSize}
              onPress={() => onMediaPress?.(media)}
              renderOverlay={(isLoaded) => {
                if (!isLoaded || media.type !== 'video') return null;

                return (
                  <View style={styles.videoOverlay}>
                    <View style={styles.playButton}>
                      <Feather name="play" size={16} color="white" />
                    </View>
                  </View>
                );
              }}
            />
          ))}
        </View>
      )}

      {/* Photo count indicator */}
      {mediaCount > 0 && (
        <Text style={styles.mediaCount}>
          {mediaCount} item{mediaCount > 1 ? 's' : ''}
        </Text>
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

export default memo(PostFeedItem);

const styles = StyleSheet.create((theme) => ({
  card: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeights.medium,
  },
  headerTextWrap: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  ownerName: {
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
  },
  menuButton: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    borderRadius: theme.radii.full,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginHorizontal: -GAP / 2,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaCount: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
}));
