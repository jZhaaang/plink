import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Feather } from '@expo/vector-icons';
import { LinkLocationRow, LinkMedia } from '../../../lib/models';
import { useLocationMedia } from '../hooks/useLocationMedia';
import { MediaTile, Row, Spinner, Stack, Text } from '../../../components';

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
  onChange: () => void;
}

function LocationSectionHeader({
  location,
  mediaCount,
  hasMore,
  onConfirm,
  onChange,
}: LocationSectionHeaderProps) {
  const { theme } = useUnistyles();
  const isUnknown = !location;
  const needsConfirm = location?.source === 'exif';

  return (
    <View style={styles.container}>
      <Row align="center" justify="space-between">
        <Row align="center" gap="xs" style={{ flex: 1 }}>
          <Feather
            name="map-pin"
            size={theme.iconSizes.sm}
            color={needsConfirm ? theme.colors.warning : theme.colors.primary}
          />
          <Stack style={{ flex: 1 }}>
            <Text variant="headingSm" color="primary" numberOfLines={1}>
              {isUnknown ? 'No Location' : location.name}
            </Text>
            <Text variant="bodySm" color="tertiary">
              {mediaCount}
              {hasMore ? '+' : ''}{' '}
              {mediaCount === 1 && !hasMore ? 'item' : 'items'}
            </Text>
          </Stack>
        </Row>

        {!isUnknown && (
          <Row gap="xs">
            {needsConfirm && (
              <Pressable onPress={onConfirm} style={styles.changeButton}>
                <Text variant="labelSm" color="success">
                  Confirm
                </Text>
              </Pressable>
            )}
            <Pressable onPress={onChange} style={styles.changeButton}>
              <Text variant="labelSm" color="accent">
                Change
              </Text>
            </Pressable>
          </Row>
        )}
      </Row>

      {needsConfirm && (
        <View style={styles.confirmRow}>
          <Feather name="help-circle" size={12} color={theme.colors.warning} />
          <Text
            variant="bodySm"
            color="tertiary"
            style={{ marginLeft: theme.spacing.xs }}
          >
            Is this the right location?
          </Text>
        </View>
      )}

      {!needsConfirm && location?.address && (
        <View style={styles.confirmRow}>
          <Text variant="bodySm" color="tertiary">
            {location.address}
          </Text>
        </View>
      )}
    </View>
  );
}

interface LocationSectionProps {
  linkId: string;
  location: LinkLocationRow | null;
  tileSize: number;
  onDeleteMedia: (media: LinkMedia) => void;
  onConfirm: () => void;
  onChange: () => void;
}

export default function LocationSection({
  linkId,
  location,
  tileSize,
  onDeleteMedia,
  onConfirm,
  onChange,
}: LocationSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const { media, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLocationMedia(linkId, location?.id ?? null);

  if (!loading && media.length === 0) return null;

  const visibleMedia = expanded ? media : media.slice(0, PREVIEW_COUNT);
  const rows = chunk(visibleMedia, COLUMNS);

  const showExpandButton = !expanded && media.length >= PREVIEW_COUNT;
  const showLoadMore = expanded && hasNextPage;

  return (
    <View>
      <LocationSectionHeader
        location={location}
        mediaCount={media.length}
        hasMore={!!hasNextPage}
        onConfirm={onConfirm}
        onChange={onChange}
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
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    marginTop: theme.spacing.xl,
  },
  changeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  confirmRow: {
    marginTop: theme.spacing.xs,
    paddingLeft: theme.iconSizes.sm + theme.spacing.xs,
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
}));
