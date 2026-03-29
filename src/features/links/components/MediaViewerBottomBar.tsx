import { View, Text, FlatList } from 'react-native';
import { Image } from 'expo-image';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { LinkPostMedia, LinkPostWithMedia } from '../../../lib/models';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import { VideoPlayer } from 'expo-video';
import { VideoControls } from './VideoControls';
import { Feather } from '@expo/vector-icons';

interface MediaViewerBottomBarProps {
  post: LinkPostWithMedia | null;
  currentMediaId: string | null;
  isVideo: boolean;
  player?: VideoPlayer;
  animatedStyle: AnimatedStyle;
  pointerEvents: 'box-none' | 'none';
}

export function MediaViewerBottomBar({
  post,
  currentMediaId,
  isVideo,
  player,
  animatedStyle,
  pointerEvents,
}: MediaViewerBottomBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  if (!post) return null;

  function MediaThumbnail({
    media,
    isActive,
  }: {
    media: LinkPostMedia;
    isActive: boolean;
  }) {
    return (
      <View style={[styles.thumbnail, isActive && styles.thumbnailActive]}>
        <Image
          source={{ uri: media.thumbnailUrl ?? media.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        {media.type === 'video' && (
          <View style={styles.thumbnailVideoIcon}>
            <Feather name="play" size={theme.iconSizes.xs} color="white" />
          </View>
        )}
      </View>
    );
  }

  const displayName = post.owner.name ?? post.owner.username ?? 'Unknown';

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents={pointerEvents}
    >
      {isVideo && player && (
        <View style={styles.videoControlsSection}>
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />
          <VideoControls player={player} />
        </View>
      )}

      <View
        style={[
          styles.band,
          { paddingBottom: insets.bottom + theme.spacing.sm },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: post.owner.avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.textCol}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.time}>
                {formatRelativeTime(post.created_at)}
              </Text>
            </View>
          </View>

          {post.media.length > 1 && (
            <FlatList
              data={post.media}
              horizontal
              keyExtractor={(m) => m.id}
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailStrip}
              contentContainerStyle={{ gap: theme.spacing.xs }}
              renderItem={({ item }) => (
                <MediaThumbnail
                  media={item}
                  isActive={item.id === currentMediaId}
                />
              )}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  videoControlsSection: {},
  band: {
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  avatar: {
    width: theme.avatarSizes.md,
    height: theme.avatarSizes.md,
    borderRadius: theme.radii.full,
  },
  textCol: { gap: theme.spacing.xs },
  name: {
    color: theme.colors.white,
    fontWeight: theme.fontWeights.semibold,
    fontSize: theme.fontSizes.base,
  },
  time: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: theme.fontSizes.xs,
  },
  thumbnail: {
    width: theme.avatarSizes.md,
    height: theme.avatarSizes.md,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.7,
  },
  thumbnailStrip: { flexShrink: 0, maxWidth: 220 },
  thumbnailActive: {
    borderColor: theme.colors.white,
    opacity: 1,
  },
  thumbnailVideoIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginLeft: 1,
  },
}));
