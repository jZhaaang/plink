import { View, Text, Pressable } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
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
      <View
        style={[styles.band, { paddingTop: insets.top + theme.spacing.sm }]}
      >
        <Pressable onPress={onClose} hitSlop={8} style={styles.iconButton}>
          <Feather
            name="x"
            size={theme.iconSizes.md}
            color={theme.colors.white}
          />
        </Pressable>

        <View style={[styles.counterContainer, { top: insets.top }]}>
          <Text style={styles.counter}>
            {currentIndex + 1} of {totalCount}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onShare} hitSlop={8} style={styles.iconButton}>
            <Feather
              name="share"
              size={theme.iconSizes.md}
              color={theme.colors.white}
            />
          </Pressable>
          <Pressable onPress={onDownload} hitSlop={8} style={styles.iconButton}>
            <Feather
              name="download"
              size={theme.iconSizes.md}
              color={theme.colors.white}
            />
          </Pressable>
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
  band: {
    backgroundColor: theme.colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
}));
