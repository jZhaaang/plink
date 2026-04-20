import { useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StagedAsset } from '../hooks/useStagedMediaActions';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Row, Text } from '../../../components';

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
  const { theme } = useUnistyles();

  const sheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(1);
  const [index, setIndex] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  const COLLAPSED = 88;
  const fitSnap = Math.min(contentHeight + 50, screenHeight * 0.6);
  const tileSize =
    (screenWidth - SHEET_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
    GRID_COLUMNS;
  const preview = assets.slice(0, 4);
  const remaining = assets.length - preview.length;

  const snapPoints = useMemo(() => [COLLAPSED, fitSnap], [fitSnap]);

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
      backgroundStyle={styles.backgroundStyle}
      animatedIndex={animatedIndex}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
    >
      <Animated.View
        style={[{ flex: 1 }, expandedStyle]}
        pointerEvents={index === 1 ? 'auto' : 'none'}
      >
        {/* Header */}
        <Row style={styles.expandedHeader} justify="space-between">
          <Text variant="headingMd" color="secondary">
            {assets.length} item{assets.length === 1 ? '' : 's'} ready
          </Text>
          <Pressable onPress={onClearAll} hitSlop={8}>
            <Text variant="bodyMd" color="placeholder">
              Clear all
            </Text>
          </Pressable>
        </Row>

        <BottomSheetScrollView
          onContentSizeChange={(_: number, h: number) => setContentHeight(h)}
          contentContainerStyle={{
            paddingHorizontal: SHEET_PADDING,
            paddingBottom: SHEET_PADDING,
          }}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Staged Assets */}
          <View style={styles.gridContainer}>
            <View style={styles.gridWrap}>
              {assets.map((item) => (
                <View
                  key={item.id}
                  style={{
                    width: tileSize,
                    height: tileSize,
                  }}
                >
                  <Image
                    source={{ uri: item.thumbnailUri ?? item.asset.uri }}
                    cachePolicy="memory-disk"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: theme.radii.md,
                    }}
                    contentFit="cover"
                    transition={150}
                  />
                  {item.thumbnailStatus === 'generating' && (
                    <View style={styles.tileOverlay}>
                      <View style={styles.tileOverlayIcon}>
                        <Ionicons
                          name="time-outline"
                          size={theme.iconSizes.xs}
                          color={theme.colors.white}
                        />
                      </View>
                    </View>
                  )}
                  {item.asset.type === 'video' && (
                    <View style={styles.tileOverlay}>
                      <View style={styles.tileOverlayIcon}>
                        <Feather
                          name="play"
                          size={theme.iconSizes.xs}
                          color={theme.colors.white}
                        />
                      </View>
                    </View>
                  )}
                  <Pressable
                    onPress={() => onRemove(item.asset.uri)}
                    hitSlop={8}
                    style={styles.removeButton}
                  >
                    <Feather
                      name="x"
                      size={theme.iconSizes.xs}
                      color={theme.colors.white}
                    />
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
                  <Feather
                    name="plus"
                    size={theme.iconSizes.lg}
                    color={theme.colors.gray}
                  />
                  <Text
                    variant="bodySm"
                    color="placeholder"
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    Add
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Post Button */}
            <Pressable onPress={onUpload} disabled={uploading}>
              <View
                style={[
                  styles.postButton,
                  uploading && { opacity: theme.opacity.disabled },
                ]}
              >
                <Ionicons name="arrow-up" size={18} color="white" />
                <Text variant="headingSm" color="inverse">
                  Post
                </Text>
              </View>
            </Pressable>
          </View>
        </BottomSheetScrollView>
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
        <Row align="center" gap="md">
          <Row>
            {preview.map((item, i) => {
              const showRemaining = i === preview.length - 1 && remaining > 0;

              return (
                <View
                  key={item.id}
                  style={{
                    width: theme.iconSizes.xl,
                    height: theme.iconSizes.xl,
                    borderRadius: theme.radii.sm,
                    marginLeft: i === 0 ? 0 : -theme.spacing.sm,
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
                      <Text variant="labelSm" color="inverse">
                        +{remaining}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </Row>

          <Text variant="labelMd" color="secondary" style={{ flex: 1 }}>
            {assets.length} item{assets.length === 1 ? '' : 's'} ready
          </Text>

          <Pressable onPress={onUpload} disabled={uploading}>
            <View
              style={[styles.uploadMiniButton, uploading && { opacity: 0.5 }]}
            >
              <Ionicons
                name="arrow-up"
                size={theme.iconSizes.sm}
                color="white"
              />
            </View>
          </Pressable>
        </Row>
      </Animated.View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  backgroundStyle: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
  },
  expandedHeader: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    zIndex: 10,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  gridContainer: {
    marginTop: theme.spacing.md,
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
    height: theme.iconSizes.xl,
    width: theme.iconSizes.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.overlay,
  },
  removeButton: {
    position: 'absolute',
    right: -theme.spacing.sm,
    top: -theme.spacing.sm,
    height: theme.iconSizes.lg,
    width: theme.iconSizes.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.darkGray,
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
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
  uploadMiniButton: {
    height: theme.iconSizes.xl,
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
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
}));
