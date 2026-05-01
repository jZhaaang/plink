import { View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ActiveFeedLink } from '../../../lib/models';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import {
  Button,
  Card,
  CardSection,
  Row,
  Stack,
  Text,
} from '../../../components';
import { primaryLocationLabel } from '../../../lib/utils/location';

interface Props {
  peek?: boolean;
  link: ActiveFeedLink;
  isMember?: boolean;
  onPress: () => void;
  onJoin: () => void;
}

export default function ActiveLinkCard({
  peek = false,
  link,
  isMember,
  onPress,
  onJoin,
}: Props) {
  const { theme } = useUnistyles();

  const locationLabel = primaryLocationLabel(link.locations);
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const HORIZONTAL_PADDING = theme.spacing.md * 2;

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        peek && { width: SCREEN_WIDTH - HORIZONTAL_PADDING - 80 },
      ]}
    >
      <CardSection>
        {/* Top row */}
        <Row align="center">
          {link.party.avatarUrl ? (
            <Image
              source={{ uri: link.party.avatarUrl }}
              style={styles.avatar}
              cachePolicy="memory-disk"
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <MaterialIcons
                name="group"
                size={theme.iconSizes.sm}
                color={theme.colors.gray}
              />
            </View>
          )}

          <Stack flex={1} style={{ marginLeft: theme.spacing.md }}>
            <Text variant="headingSm" color="primary" numberOfLines={1}>
              {link.name}
            </Text>
            <Text variant="bodySm" color="secondary" numberOfLines={1}>
              with {link.party.name}
            </Text>
          </Stack>

          {locationLabel && (
            <Row
              align="center"
              justify="flex-end"
              gap="xs"
              style={styles.locationWrap}
            >
              <MaterialIcons
                name="place"
                size={theme.iconSizes.xs}
                color={theme.colors.textTertiary}
              />
              <Text
                variant="bodySm"
                color="tertiary"
                style={styles.locationText}
                numberOfLines={2}
              >
                {locationLabel}
              </Text>
            </Row>
          )}
        </Row>

        {/* Bottom row */}
        <Row align="center" justify="space-between">
          <Row align="center" gap="md">
            <Row align="center" gap="xs">
              <MaterialIcons
                name="access-time"
                size={theme.iconSizes.xs}
                color={theme.colors.textTertiary}
              />
              <Text variant="bodySm" color="tertiary">
                {formatRelativeTime(link.created_at)}
              </Text>
            </Row>
            <Row align="center" gap="xs">
              <MaterialIcons
                name="people-outline"
                size={theme.iconSizes.xs}
                color={theme.colors.textTertiary}
              />
              <Text variant="bodySm" color="tertiary">
                {link.members.length}
              </Text>
            </Row>
            <Row align="center" gap="xs">
              <MaterialIcons
                name="image"
                size={theme.iconSizes.xs}
                color={theme.colors.textTertiary}
              />
              <Text variant="bodySm" color="tertiary">
                {link.mediaCount}
              </Text>
            </Row>
          </Row>

          <Button
            title={isMember ? 'Joined' : 'Join'}
            onPress={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            size="sm"
            variant={isMember ? 'outline' : 'primary'}
            disabled={isMember}
          />
        </Row>
      </CardSection>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 2,
    borderColor: theme.colors.badgeActive,
    gap: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: theme.avatarSizes.md,
    height: theme.avatarSizes.md,
    borderRadius: theme.radii.full,
  },
  avatarFallback: {
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 2,
    maxWidth: 150,
    marginLeft: theme.spacing.sm,
  },
  locationText: {
    textAlign: 'right',
    flexShrink: 1,
  },
  textWrap: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}));
