import { useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StagedAsset } from '../hooks/useStagedMedia';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type Props = {
  assets: StagedAsset[];
  onAddFromGallery: () => void;
  onRemove: (uri: string) => void;
  onClearAll: () => void;
  onUpload: () => void;
  uploading: boolean;
};

const GRID_COLUMNS = 3;
const GRID_GAP = 8;
const SHEET_PADDING = 16;

export default function StagedMediaSheet({
  assets,
  onAddFromGallery,
  onRemove,
  onClearAll,
  onUpload,
  uploading,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [index, setIndex] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const sheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(1);

  const COLLAPSED = 88;
  const fitSnap = Math.min(contentHeight + 50, screenHeight * 0.6);
  const isCollapsed = index === 0;
  const tileSize =
    (screenWidth - SHEET_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS;
  const preview = assets.slice(0, 4);
  const remaining = assets.length - preview.length;

  const snapPoints = useMemo(() => [COLLAPSED, fitSnap], [fitSnap]);

  const postStyle = useAnimatedStyle(() => {
    const t = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [0, 1, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: t,
      transform: [
        {
          translateY: interpolate(
            animatedIndex.value,
            [0, 1],
            [14, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 0.35, 1],
      [0, 0.2, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          animatedIndex.value,
          [0, 1],
          [10, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const collapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 0.65, 1],
      [1, 0.2, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          animatedIndex.value,
          [0, 1],
          [1, 0.96],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <BottomSheet
      ref={sheetRef}
      index={index}
      onChange={setIndex}
      animatedIndex={animatedIndex}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
    >
      <View className="flex-1">
        <BottomSheetScrollView
          onContentSizeChange={(_, h) => setContentHeight(h)}
          contentContainerStyle={{
            paddingHorizontal: SHEET_PADDING,
            paddingBottom: 64,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Expanded View */}
          <Animated.View
            style={[{ flex: 1 }, expandedStyle]}
            pointerEvents={index === 1 ? 'auto' : 'none'}
          >
            {/* Header */}
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.96)',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
                zIndex: 10,
                paddingBottom: 8,
                marginBottom: 12,
              }}
            >
              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-base font-semibold text-slate-800">
                  {assets.length} item{assets.length === 1 ? '' : 's'} ready
                </Text>
                <Pressable onPress={onClearAll} hitSlop={8}>
                  <Text className="text-sm text-slate-400">Clear all</Text>
                </Pressable>
              </View>
            </View>

            {/* Staged Assets */}
            <View className="flex-1">
              <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
                {assets.map((item) => (
                  <View
                    key={item.id}
                    style={{ width: tileSize, height: tileSize }}
                  >
                    <Image
                      source={{ uri: item.thumbnailUri ?? item.asset.uri }}
                      cachePolicy="memory-disk"
                      style={{
                        width: tileSize,
                        height: tileSize,
                        borderRadius: 12,
                      }}
                      contentFit="cover"
                      transition={150}
                    />
                    {item.thumbnailStatus === 'generating' && (
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-black/50">
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="white"
                          />
                        </View>
                      </View>
                    )}
                    {item.asset.type === 'video' && (
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-black/50">
                          <Feather name="play" size={14} color="white" />
                        </View>
                      </View>
                    )}
                    <Pressable
                      onPress={() => onRemove(item.asset.uri)}
                      className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-black/70"
                      hitSlop={8}
                    >
                      <Feather name="x" size={12} color="white" />
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  onPress={onAddFromGallery}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 12,
                  }}
                  className="items-center justify-center border-2 border-dashed border-slate-200"
                >
                  <Feather name="plus" size={24} color="#94a3b8" />
                  <Text className="mt-1 text-xs text-slate-400">Add</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Collapsed View */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: SHEET_PADDING,
                right: SHEET_PADDING,
                top: 8,
              },
              collapsedStyle,
            ]}
            pointerEvents={index === 0 ? 'auto' : 'none'}
          >
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center">
                {preview.map((item, i) => {
                  const showRemaining =
                    i === preview.length - 1 && remaining > 0;

                  return (
                    <View
                      key={item.id}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        marginLeft: i === 0 ? 0 : -6,
                        zIndex: 10 - i,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#fff',
                      }}
                    >
                      <Image
                        source={{ uri: item.thumbnailUri ?? item.asset.uri }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />

                      {showRemaining && (
                        <View className="absolute inset-0 items-center justify-center bg-black/40">
                          <Text className="text-[11px] font-semibold text-white">
                            +{remaining}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <Text className="flex-1 text-sm font-medium text-slate-700">
                {assets.length} item{assets.length === 1 ? '' : 's'} ready
              </Text>

              <Pressable
                onPress={onUpload}
                disabled={uploading}
                className="h-10 px-4 rounded-lg bg-blue-600 flex-row items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Ionicons name="arrow-up" size={16} color="white" />
              </Pressable>
            </View>
          </Animated.View>
        </BottomSheetScrollView>

        {/* Post Button */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: 20,
            },
            postStyle,
          ]}
          pointerEvents={isCollapsed ? 'none' : 'auto'}
        >
          <Pressable
            onPress={onUpload}
            disabled={uploading}
            className="h-12 rounded-full bg-blue-600 px-5 flex-row items-center justify-center gap-2 disabled:opacity-50"
          >
            <Ionicons name="arrow-up" size={18} color="white" />
            <Text className="text-white text-sm font-semibold">Post</Text>
          </Pressable>
        </Animated.View>
      </View>
    </BottomSheet>
  );
}
