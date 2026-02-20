import { ReactNode } from 'react';
import { View, Pressable, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

type BannerSource = {
  uri: string;
  cropX?: number;
  cropY?: number;
} | null;

type HeroBannerProps = {
  banner: BannerSource;
  gradientColors?: [string, string];
  onBack: () => void;
  onMenuPress?: (event: GestureResponderEvent) => void;
  children?: ReactNode;
};

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
              className="absolute inset-0 bg-black/20"
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
      <View className="w-full" style={{ aspectRatio: 2.5 }}>
        {renderImage({ width: '100%', height: '100%' })}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          className="absolute bottom-0 left-0 right-0 h-28"
        />

        {/* Overlay content (title, subtitle, badges) */}
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          {children}
        </View>
        {/* Floating nav bar */}
        <View
          className="absolute top-0 left-0 right-0"
          pointerEvents="box-none"
        >
          <View
            className="flex-row items-center justify-between px-4 py-2"
            pointerEvents="box-none"
          >
            <Pressable
              onPress={onBack}
              className="w-9 h-9 rounded-full bg-black/30 items-center justify-center"
            >
              <Feather name="arrow-left" size={20} color="#fff" />
            </Pressable>

            {onMenuPress ? (
              <Pressable
                onPress={onMenuPress}
                className="w-9 h-9 rounded-full bg-black/30 items-center justify-center"
              >
                <Feather name="more-vertical" size={20} color="#fff" />
              </Pressable>
            ) : (
              <View className="w-9" />
            )}
          </View>
        </View>
      </View>
    </>
  );
}
