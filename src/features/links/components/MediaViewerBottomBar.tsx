import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { LinkPostWithMedia } from '../../../lib/models';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import { BlurView } from 'expo-blur';
import { BLUR_INTENSITY } from './MediaViewerTopBar';

interface MediaViewerBottomBarProps {
  post: LinkPostWithMedia | null;
  animatedStyle: AnimatedStyle;
  pointerEvents: 'box-none' | 'none';
}

export function MediaViewerBottomBar({
  post,
  animatedStyle,
  pointerEvents,
}: MediaViewerBottomBarProps) {
  const insets = useSafeAreaInsets();

  if (!post) return null;

  const displayName = post.owner.name ?? post.owner.username ?? 'Unknown';

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents={pointerEvents}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.55)']}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 64 }]}>
        <View style={styles.pill}>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="dark"
            style={styles.pillInner}
          >
            <Image
              source={{ uri: post.owner.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />

            <View style={styles.textCol}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.time}>
                {formatRelativeTime(post.created_at)}
              </Text>
            </View>
          </BlurView>
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
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  pill: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
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
}));
