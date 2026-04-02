import { View } from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { HomeFeedLink } from '../../../lib/models';
import {
  AvatarStack,
  Card,
  CardSection,
  MediaGrid,
  Text,
} from '../../../components';
import { primaryLocationLabel } from '../../../lib/utils/location';

interface Props {
  link: HomeFeedLink;
  onPress: () => void;
  onMediaPress: () => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function HomeLinkCard({ link, onPress, onMediaPress }: Props) {
  const { theme } = useUnistyles();

  const locationLabel = primaryLocationLabel(link.locations);
  const memberAvatarUris =
    link.members
      ?.map((m) => m.avatarUrl)
      .filter((url): url is string => !!url) ?? [];

  return (
    <Card onPress={onPress} style={styles.card}>
      <CardSection>
        {/* Header */}
        <View style={styles.header}>
          {link.party.avatarUrl ? (
            <Image
              source={{ uri: link.party.avatarUrl }}
              style={styles.partyAvatar}
              cachePolicy="memory-disk"
              contentFit="cover"
            />
          ) : (
            <View style={styles.partyAvatar}>
              <MaterialIcons
                name="group"
                size={theme.iconSizes.sm}
                color={theme.colors.gray}
              />
            </View>
          )}

          <View style={styles.headerText}>
            <Text variant="headingMd" color="primary" numberOfLines={1}>
              {link.name}
            </Text>
            <Text variant="bodySm" color="secondary" numberOfLines={1}>
              with {link.party.name} on {formatDate(link.created_at)}
            </Text>
          </View>

          <AvatarStack
            avatarUris={memberAvatarUris}
            maxVisible={3}
            size={theme.avatarSizes.xs}
          />
        </View>

        {/* Media grid */}
        {link.media.length > 0 && (
          <MediaGrid
            media={link.media}
            columns={3}
            maxItems={6}
            scrollEnabled={false}
            onMediaPress={onMediaPress}
          />
        )}

        {/* Footer metadata */}
        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Text variant="bodySm" color="tertiary">
              {link.media.length} {link.media.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
          {locationLabel && (
            <View style={styles.metaItem}>
              <Feather
                name="map-pin"
                size={theme.iconSizes.xs}
                color={theme.colors.textTertiary}
              />
              <Text variant="bodySm" color="tertiary" numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
          )}
        </View>
      </CardSection>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  partyAvatar: {
    width: theme.avatarSizes.md,
    height: theme.avatarSizes.md,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  partyName: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  linkName: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
  },
}));
