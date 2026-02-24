import { ReactNode } from 'react';
import { View, Pressable, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native-unistyles';

interface BannerSource {
  uri: string;
  cropX?: number;
  cropY?: number;
}

interface HeroBannerProps {
  banner: BannerSource | null;
  gradientColors?: [string, string];
  onBack: () => void;
  onMenuPress?: (event: GestureResponderEvent) => void;
  children?: ReactNode;
}

export default function HeroBanner({
  banner,
  gradientColors = ['#bfdbfe', '#3b82f6'],
  onBack,
  onMenuPress,
  children,
}: HeroBannerProps) {
  const insets = useSafeAreaInsets();

  const renderImage = (style: object, blurRadius?: number) => {
    if (!banner) {
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={style}
        />
      );
    }

    return (
      <Image
        source={{ uri: banner.uri }}
        cachePolicy="memory-disk"
        contentFit="cover"
        contentPosition={
          banner.cropX != null && banner.cropY != null
            ? { left: `${banner.cropX}%`, top: `${banner.cropY}%` }
            : undefined
        }
        blurRadius={blurRadius}
        style={[{ width: '100%', height: '100%' }, style]}
      />
    );
  };

  return (
    <>
      {/* Status bar fill */}
      <View style={{ height: insets.top, overflow: 'hidden' }}>
        {banner ? (
          <>
            {renderImage({ width: '100%', height: insets.top + 40 }, 20)}
            <View
              style={styles.statusBarOverlay}
              pointerEvents="none"
            />
          </>
        ) : (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '100%', height: insets.top + 40 }}
          />
        )}
      </View>

      {/* Hero image */}
      <View style={styles.heroContainer}>
        {renderImage({ width: '100%', height: '100%' })}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 112 }}
        />

        {/* Overlay content (title, subtitle, badges) */}
        <View style={styles.overlayContent}>
          {children}
        </View>
        {/* Floating nav bar */}
        <View
          style={styles.navBar}
          pointerEvents="box-none"
        >
          <View
            style={styles.navRow}
            pointerEvents="box-none"
          >
            <Pressable onPress={onBack}>
              <View style={styles.navButton}>
                <Feather name="arrow-left" size={20} color="#fff" />
              </View>
            </Pressable>

            {onMenuPress ? (
              <Pressable onPress={onMenuPress}>
                <View style={styles.navButton}>
                  <Feather name="more-vertical" size={20} color="#fff" />
                </View>
              </Pressable>
            ) : (
              <View style={styles.navSpacer} />
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlayLight,
  },
  heroContainer: {
    width: '100%',
    aspectRatio: 2.5,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.overlayMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSpacer: {
    width: 36,
  },
}));
