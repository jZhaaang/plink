import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  interpolate,
  Extrapolation,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { Pressable, useWindowDimensions, View, Text } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type Props = {
  assets: ImagePicker.ImagePickerAsset[];
  onAddFromGallery: () => void;
  onRemove: (uri: string) => void;
  onClearAll: () => void;
  onUpload: () => void;
  uploading: boolean;
};

const GRID_COLUMNS = 3;
const GRID_GAP = 8;
const SHEET_PADDING = 16;
const COLLAPSED_HEIGHT = 80;
const SPRING_CONFIG = { damping: 100, stiffness: 400 };

export default function StagedMediaSheet({
  assets,
  onAddFromGallery,
  onRemove,
  onClearAll,
  onUpload,
  uploading,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const expandedHeight = screenHeight * 0.55;
  const sheetHeight = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const dismissY = useSharedValue(0);
  const tileSize =
    (screenWidth - SHEET_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS;

  const expandedAnimatedProps = useAnimatedProps(() => ({
    pointerEvents: (sheetHeight.value > COLLAPSED_HEIGHT + 40
      ? 'auto'
      : 'none') as 'auto' | 'none',
  }));
  const collapsedAnimatedProps = useAnimatedProps(() => ({
    pointerEvents: (sheetHeight.value <= COLLAPSED_HEIGHT + 40
      ? 'auto'
      : 'none') as 'auto' | 'none',
  }));

  useEffect(() => {
    sheetHeight.value = withSpring(expandedHeight, SPRING_CONFIG);
  }, []);

  const tapGesture = Gesture.Tap().onEnd(() => {
    const mid = (COLLAPSED_HEIGHT + expandedHeight) / 2;
    if (sheetHeight.value > mid) {
      sheetHeight.value = withSpring(COLLAPSED_HEIGHT, SPRING_CONFIG);
    } else {
      sheetHeight.value = withSpring(expandedHeight, SPRING_CONFIG);
    }
  });
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      dragStart.value = sheetHeight.value;
    })
    .onUpdate((event) => {
      const newHeight = dragStart.value - event.translationY;
      sheetHeight.value = Math.max(
        COLLAPSED_HEIGHT,
        Math.min(expandedHeight, newHeight),
      );
    })
    .onEnd((event) => {
      const mid = (COLLAPSED_HEIGHT + expandedHeight) / 2;
      const goingUp = event.velocityY < -500;
      const goingDown = event.velocityY > 500;

      if (goingUp || (!goingDown && sheetHeight.value > mid)) {
        sheetHeight.value = withSpring(expandedHeight, SPRING_CONFIG);
      } else {
        sheetHeight.value = withSpring(COLLAPSED_HEIGHT, SPRING_CONFIG);
      }
    });
  const handleGesture = Gesture.Exclusive(tapGesture, dragGesture);

  const dismiss = (callback: () => void) => {
    dismissY.value = withTiming(expandedHeight, {
      duration: 250,
      easing: Easing.in(Easing.ease),
    });
    setTimeout(callback, 250);
  };

  const handleClearAll = () => {
    dismiss(onClearAll);
  };

  const handleRemove = (uri: string) => {
    if (assets.length === 1) {
      dismiss(() => onRemove(uri));
    } else {
      onRemove(uri);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
    paddingBottom: insets.bottom,
    transform: [{ translateY: dismissY.value }],
  }));

  const expandedOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      sheetHeight.value,
      [COLLAPSED_HEIGHT + 40, COLLAPSED_HEIGHT + 120],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const collapsedOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      sheetHeight.value,
      [COLLAPSED_HEIGHT, COLLAPSED_HEIGHT + 80],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        animatedStyle,
      ]}
    >
      {/* Drag handle */}
      <GestureDetector gesture={handleGesture}>
        <Animated.View
          style={{ alignItems: 'center', paddingVertical: 10 }}
          hitSlop={{ top: 20, bottom: 20 }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#cbd5e1',
            }}
          />
        </Animated.View>
      </GestureDetector>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: SHEET_PADDING }}>
        {/* Expanded grid */}
        <Animated.View
          style={[{ flex: 1 }, expandedOpacity]}
          animatedProps={expandedAnimatedProps}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-slate-800">
              {assets.length} media ready
            </Text>
            <Pressable onPress={handleClearAll} hitSlop={8}>
              <Text className="text-sm text-slate-400">Clear all</Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
            {assets.map((asset) => (
              <View
                key={asset.uri}
                style={{ width: tileSize, height: tileSize }}
              >
                <Image
                  source={{ uri: asset.uri }}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 12,
                  }}
                  contentFit="cover"
                  transition={150}
                />
                <Pressable
                  onPress={() => handleRemove(asset.uri)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black/70 rounded-full items-center justify-center"
                  hitSlop={8}
                >
                  <Feather name="x" size={12} color="white" />
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={onAddFromGallery}
              style={{ width: tileSize, height: tileSize, borderRadius: 12 }}
              className="border-2 border-dashed border-slate-200 items-center justify-center active:bg-slate-50"
            >
              <Feather name="plus" size={24} color="#94a3b8" />
              <Text className="text-xs text-slate-400 mt-1">Add</Text>
            </Pressable>
          </View>

          <View className="mt-4">
            <Pressable
              onPress={onUpload}
              disabled={uploading}
              className="h-12 rounded-xl bg-blue-600 flex-row items-center justify-center gap-2 active:bg-blue-700 disabled:opacity-50"
            >
              <Ionicons name="arrow-up" size={18} color="white" />
              <Text className="text-white font-semibold text-base">Post</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Collapsed summary (overlaid on top) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: SHEET_PADDING,
              right: SHEET_PADDING,
            },
            collapsedOpacity,
          ]}
          animatedProps={collapsedAnimatedProps}
        >
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center">
              {assets.slice(0, 3).map((asset, index) => (
                <Image
                  key={asset.uri}
                  source={{ uri: asset.uri }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    marginLeft: index === 0 ? 0 : -12,
                    zIndex: 3 - index,
                  }}
                  contentFit="cover"
                />
              ))}
            </View>

            <Text className="flex-1 text-sm font-medium text-slate-700">
              {assets.length} photo{assets.length !== 1 ? 's' : ''} ready
            </Text>

            <Pressable
              onPress={onUpload}
              disabled={uploading}
              className="h-12 px-5 rounded-xl bg-blue-600 flex-row items-center justify-center gap-1.5 active:bg-blue-700 disabled:opacity-50"
            >
              <Ionicons name="arrow-up" size={14} color="white" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
