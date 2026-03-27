import { ReactNode } from 'react';
import { View, Text, Pressable, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface Props {
  variant: 'default' | 'avatar-only';
  avatarUri?: string | null;
  bannerUri: string | null;
  emptyHint?: string;
  onBack: () => void;
  onMenuPress?: (event: GestureResponderEvent) => void;
  children?: ReactNode;
}

export default function HeroBanner({
  variant,
  avatarUri,
  bannerUri,
  emptyHint,
  onBack,
  onMenuPress,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const renderImage = (style: object, blurRadius?: number) => {
    if (!bannerUri) {
      return (
        <View style={[style, styles.emptyBanner]}>
          <Feather
            name="image"
            size={theme.iconSizes.lg}
            color={theme.colors.gray}
          />
          {emptyHint && <Text style={styles.emptyBannerText}>{emptyHint}</Text>}
        </View>
      );
    }

    return (
      <Image
        source={{ uri: bannerUri }}
        cachePolicy="memory-disk"
        contentFit="cover"
        blurRadius={blurRadius}
        style={[{ width: '100%', height: '100%' }, style]}
      />
    );
  };

  return (
    <>
      {/* Status bar fill */}
      <View style={{ height: insets.top, overflow: 'hidden' }}>
        {bannerUri ? (
          <>
            {renderImage({ width: '100%', height: insets.top + 40 }, 100)}
            <View style={styles.statusBarOverlay} pointerEvents="none" />
          </>
        ) : (
          <View
            style={{
              width: '100%',
              height: insets.top + 40,
              backgroundColor: theme.colors.accentSurface,
            }}
          />
        )}
      </View>

      {/* Hero image */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroContainer}>
          {renderImage({ width: '100%', height: '100%' })}

          {/* Overlay content */}
          {variant !== 'avatar-only' && (
            <>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']}
                locations={[0, 0.65, 1]}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 120,
                }}
              />
              <View style={styles.overlayContent}>
                <View style={styles.overlayText}>{children}</View>
              </View>
            </>
          )}

          {/* Floating nav bar */}
          <View style={styles.navBar} pointerEvents="box-none">
            <View style={styles.navRow} pointerEvents="box-none">
              <Pressable onPress={onBack}>
                <View style={styles.navButton}>
                  <Feather
                    name="arrow-left"
                    size={theme.iconSizes.md}
                    color={theme.colors.white}
                  />
                </View>
              </Pressable>

              {onMenuPress ? (
                <Pressable onPress={onMenuPress}>
                  <View style={styles.navButton}>
                    <Feather
                      name="more-vertical"
                      size={theme.iconSizes.md}
                      color={theme.colors.white}
                    />
                  </View>
                </Pressable>
              ) : (
                <View style={styles.navSpacer} />
              )}
            </View>
          </View>
        </View>

        {variant === 'avatar-only' && (
          <View style={styles.avatarOverlap} pointerEvents="box-none">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                cachePolicy="memory-disk"
                contentFit="cover"
                style={styles.avatarOverlapImage}
              />
            ) : (
              <View style={styles.avatarOverlapImage}>
                <MaterialIcons
                  name="group"
                  size={theme.iconSizes.lg}
                  color={theme.colors.gray}
                />
              </View>
            )}
          </View>
        )}
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
  heroWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  heroContainer: {
    width: '100%',
    aspectRatio: 2.5,
  },
  emptyBanner: {
    backgroundColor: theme.colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  emptyBannerText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.iconSecondary,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  overlayText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },

  avatarOverlap: {
    position: 'absolute',
    bottom: -40,
    left: theme.spacing.lg,
  },
  avatarOverlapImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.full,
    borderWidth: 3,
    borderColor: theme.colors.background,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
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
