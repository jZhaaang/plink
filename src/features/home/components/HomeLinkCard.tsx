import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { HomeFeedLink } from '../../../lib/models';
import { AvatarStack, Card, CardSection, MediaGrid } from '../../../components';

interface Props {
  link: HomeFeedLink;
  onPress: () => void;
  onMediaPress: () => void;
}

const AVATAR_SIZE = 40;

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function HomeLinkCard({ link, onPress, onMediaPress }: Props) {
  const { theme } = useUnistyles();

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
              <MaterialIcons name="group" size={16} color={theme.colors.gray} />
            </View>
          )}

          <View style={styles.headerText}>
            <Text style={styles.linkName} numberOfLines={1}>
              {link.name}
            </Text>
            <Text style={styles.partyName} numberOfLines={1}>
              with {link.party.name} on {formatDate(link.created_at)}
            </Text>
          </View>

          <AvatarStack avatarUris={memberAvatarUris} maxVisible={3} size={24} />
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
            <Text style={styles.metaText}>
              {link.media.length} {link.media.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
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
  date: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
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
