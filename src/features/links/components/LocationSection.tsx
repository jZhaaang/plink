import { useEffect, useState } from 'react';
import { View, Pressable, GestureResponderEvent } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Feather } from '@expo/vector-icons';
import { LinkLocationRow, LinkMedia } from '../../../lib/models';
import { useLocationMedia } from '../hooks/useLocationMedia';
import { MediaTile, Row, Spinner, Stack, Text } from '../../../components';
import DropdownMenu from '../../../components/DropdownMenu';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const PREVIEW_COUNT = 8;
const TILE_GAP = 2;
const COLUMNS = 4;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    result.push(arr.slice(i, i + size));
  return result;
}

interface LocationSectionHeaderProps {
  location: LinkLocationRow | null;
  mediaCount: number;
  hasMore: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function LocationSectionHeader({
  location,
  mediaCount,
  hasMore,
  onConfirm,
  onEdit,
  onDelete,
}: LocationSectionHeaderProps) {
  const { theme } = useUnistyles();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );

  const isUnknown = !location;
  const needsConfirm = !location?.confirmed_at;

  const handleMenuPress = (event: GestureResponderEvent) => {
    event.currentTarget.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setMenuAnchor({ x: x + width, y: y + height });
        setMenuVisible(true);
      },
    );
  };

  return (
    <View style={styles.container}>
      <Row align="flex-start" justify="space-between" gap="sm">
        <Row align="flex-start" gap="xs" style={{ flex: 1, minWidth: 0 }}>
          <Feather
            name="map-pin"
            size={theme.iconSizes.sm}
            color={needsConfirm ? theme.colors.warning : theme.colors.primary}
            style={{ marginTop: 2 }}
          />
          <Stack gap="xs" style={{ flexShrink: 1 }}>
            <Row align="center" gap="xs" style={{ flexShrink: 1, minWidth: 0 }}>
              <Text
                variant="headingMd"
                color="primary"
                style={{ flexShrink: 1 }}
              >
                {isUnknown ? 'No Location' : location.name}
              </Text>
              <View style={styles.badge}>
                <Text variant="labelSm" color="secondary">
                  {mediaCount}
                </Text>
              </View>
            </Row>
            {!isUnknown && location.address && (
              <Text variant="bodySm" color="tertiary">
                {location.address}
              </Text>
            )}
          </Stack>
        </Row>

        {!isUnknown && (
          <View>
            <Row align="center" gap="xs" style={{ flexShrink: 0 }}>
              {needsConfirm ? (
                <>
                  <Pressable onPress={onConfirm} style={styles.confirmPill}>
                    <Feather
                      name="check"
                      size={11}
                      color={theme.colors.success}
                    />
                    <Text variant="bodySm" color="success">
                      Confirm
                    </Text>
                  </Pressable>
                  <Pressable onPress={onEdit} style={styles.editPill}>
                    <Feather
                      name="edit-2"
                      size={11}
                      color={theme.colors.primary}
                    />
                    <Text variant="bodySm" color="accent">
                      Edit
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={handleMenuPress} hitSlop={6}>
                  <Feather
                    name="more-horizontal"
                    size={16}
                    color={theme.colors.textTertiary}
                  />
                </Pressable>
              )}
            </Row>

            <DropdownMenu
              visible={menuVisible}
              onClose={() => setMenuVisible(false)}
              anchor={menuAnchor}
              items={[
                {
                  icon: 'edit-2',
                  label: 'Edit location',
                  onPress: onEdit,
                },
                {
                  icon: 'trash-2',
                  label: 'Remove location',
                  variant: 'danger',
                  onPress: onDelete,
                },
              ]}
            />
          </View>
        )}
      </Row>
    </View>
  );
}

interface SelectableTileProps {
  item: LinkMedia;
  tileSize: number;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function SelectableTile({
  item,
  tileSize,
  isSelecting,
  isSelected,
  onPress,
  onLongPress,
}: SelectableTileProps) {
  const { theme } = useUnistyles();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(isSelected ? 0.9 : 1, { duration: 150 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderRadius: interpolate(scale.value, [0.9, 1], [8, 0]),
  }));

  return (
    <View style={{ width: tileSize, height: tileSize }}>
      <Animated.View
        style={[
          { width: tileSize, height: tileSize, overflow: 'hidden' },
          animatedStyle,
        ]}
      >
        <MediaTile
          uri={item.thumbnailUrl ?? (item.type === 'video' ? null : item.url)}
          width={tileSize}
          height={tileSize}
          borderRadius={0}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      </Animated.View>

      {isSelecting && (
        <View style={styles.selectionIndicator}>
          <View
            style={[
              styles.selectionCircle,
              isSelected && {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            {isSelected && <Feather name="check" size={14} color="white" />}
          </View>
        </View>
      )}
    </View>
  );
}

interface LocationSectionProps {
  linkId: string;
  location: LinkLocationRow | null;
  onPressMedia: (media: LinkMedia) => void;
  onConfirm: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSelecting: boolean;
  selectedMedia: Map<string, LinkMedia>;
  onEnterSelectMode: (media: LinkMedia) => void;
  onToggleSelect: (media: LinkMedia) => void;
}

export default function LocationSection({
  linkId,
  location,
  onPressMedia,
  onConfirm,
  onEdit,
  onDelete,
  isSelecting,
  selectedMedia,
  onEnterSelectMode,
  onToggleSelect,
}: LocationSectionProps) {
  const { theme } = useUnistyles();

  const [containerWidth, setContainerWidth] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const { media, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLocationMedia(linkId, location?.id ?? null);

  if (!location && !loading && media.length === 0) return null;

  const tileSize =
    containerWidth > 0
      ? (containerWidth - TILE_GAP * (COLUMNS - 1)) / COLUMNS
      : 0;
  const visibleMedia = expanded ? media : media.slice(0, PREVIEW_COUNT);
  const rows = chunk(visibleMedia, COLUMNS);

  const showExpandButton = !expanded && media.length >= PREVIEW_COUNT;
  const showLoadMore = expanded && hasNextPage;

  return (
    <View
      style={{ marginBottom: theme.spacing.md }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <LocationSectionHeader
        location={location}
        mediaCount={media.length}
        hasMore={!!hasNextPage}
        onConfirm={onConfirm}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {loading ? (
        <View style={styles.loadingRow}>
          <Spinner />
        </View>
      ) : (
        rows.map((row, i) => (
          <Row key={i} gap="xs" style={{ marginBottom: theme.spacing.xs }}>
            {row.map((item) => (
              <SelectableTile
                key={item.id}
                item={item}
                tileSize={tileSize}
                isSelecting={isSelecting}
                isSelected={selectedMedia.has(item.id)}
                onPress={() => {
                  if (isSelecting) onToggleSelect(item);
                  else onPressMedia(item);
                }}
                onLongPress={() => {
                  if (!isSelecting) onEnterSelectMode(item);
                }}
              />
            ))}
          </Row>
        ))
      )}

      {showExpandButton && (
        <Pressable
          onPress={() => setExpanded(true)}
          style={styles.actionButton}
        >
          <Text variant="labelSm" color="accent">
            Show all {hasNextPage ? `${media.length}+` : media.length} items
          </Text>
        </Pressable>
      )}

      {showLoadMore && (
        <Pressable
          onPress={() => fetchNextPage()}
          style={styles.actionButton}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Spinner />
          ) : (
            <Text variant="labelSm" color="accent">
              Load more
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  selectionCircle: {
    width: theme.iconSizes.md,
    height: theme.iconSizes.md,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    backgroundColor: `${theme.colors.black}50`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.sm,
  },
  changeButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  confirmRow: {
    paddingLeft: theme.iconSizes.sm + theme.spacing.xs,
  },
  confirmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    backgroundColor: `${theme.colors.success}20`,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    backgroundColor: `${theme.colors.primary}20`,
  },
  loadingRow: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  dropdown: {
    position: 'absolute',
    top: 24,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 160,
    zIndex: 100,
    ...theme.shadows.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
}));
