import { View, Text, Pressable } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MediaViewerTopBarProps {
  currentIndex: number;
  totalCount: number;
  animatedStyle: AnimatedStyle;
  pointerEvents: 'box-none' | 'none';
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export const BLUR_INTENSITY = 65;

export function MediaViewerTopBar({
  currentIndex,
  totalCount,
  animatedStyle,
  pointerEvents,
  onClose,
  onDownload,
  onShare,
}: MediaViewerTopBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[styles.container, animatedStyle]}
    >
      <View style={[styles.row, { paddingTop: insets.top }]}>
        <View style={styles.pill}>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="dark"
            style={styles.pillInner}
          >
            <Pressable onPress={onClose} hitSlop={12} style={styles.pillButton}>
              <Feather
                name="x"
                size={theme.iconSizes.md}
                color={theme.colors.white}
              />
            </Pressable>
          </BlurView>
        </View>

        <View style={[styles.counterContainer, { top: insets.top }]}>
          <Text style={styles.counter}>
            {currentIndex + 1} of {totalCount}
          </Text>
        </View>

        <View style={styles.pill}>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="dark"
            style={styles.pillInner}
          >
            <Pressable onPress={onShare} hitSlop={12} style={styles.pillButton}>
              <Feather
                name="share"
                size={theme.iconSizes.md}
                color={theme.colors.white}
              />
            </Pressable>
            <View style={styles.pillDivider} />
            <Pressable
              onPress={onDownload}
              hitSlop={12}
              style={styles.pillButton}
            >
              <Feather
                name="download"
                size={theme.iconSizes.md}
                color={theme.colors.white}
              />
            </Pressable>
          </BlurView>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  counterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    color: theme.colors.white,
    fontWeight: theme.fontWeights.medium,
    fontSize: theme.fontSizes.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: theme.radii.sm,
  },
  pill: {
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pillDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
}));
