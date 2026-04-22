import { useState } from 'react';
import { View, Pressable, GestureResponderEvent } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Feather } from '@expo/vector-icons';
import { LinkLocationRow, LinkMedia } from '../../../lib/models';
import { useLocationMedia } from '../hooks/useLocationMedia';
import { MediaTile, Row, Spinner, Stack, Text } from '../../../components';
import DropdownMenu from '../../../components/DropdownMenu';

const PREVIEW_COUNT = 8;
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
  onRemove: () => void;
}

function LocationSectionHeader({
  location,
  mediaCount,
  hasMore,
  onConfirm,
  onEdit,
  onRemove,
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
                  onPress: onRemove,
                },
              ]}
            />
          </View>
        )}
      </Row>
    </View>
  );
}

interface LocationSectionProps {
  linkId: string;
  location: LinkLocationRow | null;
  tileSize: number;
  onDeleteMedia: (media: LinkMedia) => void;
  onConfirm: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export default function LocationSection({
  linkId,
  location,
  tileSize,
  onDeleteMedia,
  onConfirm,
  onEdit,
  onRemove,
}: LocationSectionProps) {
  const { theme } = useUnistyles();
  const [expanded, setExpanded] = useState(false);

  const { media, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLocationMedia(linkId, location?.id ?? null);

  if (!location && !loading && media.length === 0) return null;

  const visibleMedia = expanded ? media : media.slice(0, PREVIEW_COUNT);
  const rows = chunk(visibleMedia, COLUMNS);

  const showExpandButton = !expanded && media.length >= PREVIEW_COUNT;
  const showLoadMore = expanded && hasNextPage;

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <LocationSectionHeader
        location={location}
        mediaCount={media.length}
        hasMore={!!hasNextPage}
        onConfirm={onConfirm}
        onEdit={onEdit}
        onRemove={onRemove}
      />

      {loading ? (
        <View style={styles.loadingRow}>
          <Spinner />
        </View>
      ) : (
        rows.map((row, i) => (
          <Row key={i} gap="xs" style={styles.row}>
            {row.map((item) => (
              <MediaTile
                key={item.id}
                uri={
                  item.thumbnailUrl ?? (item.type === 'video' ? null : item.url)
                }
                width={tileSize}
                height={tileSize}
                borderRadius={0}
                onPress={() => {}}
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
  row: {
    marginBottom: 2,
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
