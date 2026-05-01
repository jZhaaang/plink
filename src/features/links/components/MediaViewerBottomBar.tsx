import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { LinkMedia } from '../../../lib/models';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import { VideoPlayer } from 'expo-video';
import { VideoControls } from './VideoControls';

interface MediaViewerBottomBarProps {
  media: LinkMedia | null;
  isVideo: boolean;
  player?: VideoPlayer;
  animatedStyle: AnimatedStyle;
  pointerEvents: 'box-none' | 'none';
}

export function MediaViewerBottomBar({
  media,
  isVideo,
  player,
  animatedStyle,
  pointerEvents,
}: MediaViewerBottomBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  if (!media) return null;

  const displayName = media.owner.name ?? media.owner.username ?? 'Unknown';

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
              source={{ uri: media.owner.avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.textCol}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.time}>
                {formatRelativeTime(media.created_at)}
              </Text>
            </View>
          </View>
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
}));
