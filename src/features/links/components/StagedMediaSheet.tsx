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
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  assets: StagedAsset[];
  onAddFromGallery: () => void;
  onRemove: (uri: string) => void;
  onClearAll: () => void;
  onUpload: () => void;
  uploading: boolean;
}

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
      <View style={styles.sheetInner}>
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
            <View style={styles.expandedHeader}>
              <View style={styles.expandedHeaderRow}>
                <Text style={styles.expandedTitle}>
                  {assets.length} item{assets.length === 1 ? '' : 's'} ready
                </Text>
                <Pressable onPress={onClearAll} hitSlop={8}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </Pressable>
              </View>
            </View>

            {/* Staged Assets */}
            <View style={styles.gridContainer}>
              <View style={styles.gridWrap}>
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
                      <View style={styles.tileOverlay}>
                        <View style={styles.tileOverlayIcon}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="white"
                          />
                        </View>
                      </View>
                    )}
                    {item.asset.type === 'video' && (
                      <View style={styles.tileOverlay}>
                        <View style={styles.tileOverlayIcon}>
                          <Feather name="play" size={14} color="white" />
                        </View>
                      </View>
                    )}
                    <Pressable
                      onPress={() => onRemove(item.asset.uri)}
                      hitSlop={8}
                    >
                      <View style={styles.removeButton}>
                        <Feather name="x" size={12} color="white" />
                      </View>
                    </Pressable>
                  </View>
                ))}

                <Pressable onPress={onAddFromGallery}>
                  <View
                    style={[
                      styles.addTile,
                      { width: tileSize, height: tileSize },
                    ]}
                  >
                    <Feather name="plus" size={24} color="#94a3b8" />
                    <Text style={styles.addTileText}>Add</Text>
                  </View>
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
            <View style={styles.collapsedRow}>
              <View style={styles.previewStack}>
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
                        <View style={styles.remainingOverlay}>
                          <Text style={styles.remainingText}>
                            +{remaining}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <Text style={styles.collapsedLabel}>
                {assets.length} item{assets.length === 1 ? '' : 's'} ready
              </Text>

              <Pressable
                onPress={onUpload}
                disabled={uploading}
              >
                <View style={[styles.uploadMiniButton, uploading && { opacity: 0.5 }]}>
                  <Ionicons name="arrow-up" size={16} color="white" />
                </View>
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
          >
            <View style={[styles.postButton, uploading && { opacity: 0.5 }]}>
              <Ionicons name="arrow-up" size={18} color="white" />
              <Text style={styles.postButtonText}>Post</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  sheetInner: {
    flex: 1,
  },
  expandedHeader: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    zIndex: 10,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  expandedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
  },
  expandedTitle: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  clearAllText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPlaceholder,
  },
  gridContainer: {
    flex: 1,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  tileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileOverlayIcon: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.overlay,
  },
  removeButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
  },
  addTileText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPlaceholder,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  previewStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textInverse,
  },
  collapsedLabel: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textSecondary,
  },
  uploadMiniButton: {
    height: 40,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  postButton: {
    height: 48,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  postButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
}));
