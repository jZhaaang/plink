import { Feather } from '@expo/vector-icons';
import {
  Card,
  CardSection,
  Text,
  Row,
  Stack,
  AvatarStack,
  Divider,
} from '../../../components';
import { LinkDetail } from '../../../lib/models';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { formatDateTime, formatDuration } from '../../../lib/utils/formatTime';
import { View } from 'react-native';

interface LinkInfoCardProps {
  link: LinkDetail;
}

export default function LinkInfoCard({ link }: LinkInfoCardProps) {
  const { theme } = useUnistyles();

  const startFormatted = formatDateTime(link.created_at);
  const endFormatted = formatDateTime(link.end_time);
  const isActive = link && !link.end_time;
  const memberAvatars = link.members
    .map((m) => m.avatarUrl)
    .filter((url) => !!url);
  const owner = link.members.find((m) => m.id === link.owner_id);

  return (
    <Card>
      <CardSection>
        {/* Time info */}
        <Stack gap="xs" style={{ marginBottom: theme.spacing.xs }}>
          <Row align="center" gap="xs">
            <Feather
              name="calendar"
              size={theme.iconSizes.sm}
              color={theme.colors.gray}
            />
            <Text variant="bodySm" color="tertiary">
              {isActive
                ? `Started ${startFormatted.date} at ${startFormatted.time}`
                : `${startFormatted.date} — ${endFormatted.date}`}
            </Text>
          </Row>
          <Row align="center" gap="xs">
            <Feather
              name="clock"
              size={theme.iconSizes.sm}
              color={theme.colors.gray}
            />
            <Text variant="bodySm" color="tertiary">
              {isActive
                ? `Active for ${formatDuration(link.created_at, null)}`
                : `Lasted ${formatDuration(link.created_at, link.end_time)}`}
            </Text>
          </Row>
        </Stack>

        {/* Members row */}
        <Row align="center" justify="space-between">
          <AvatarStack avatarUris={memberAvatars} size={theme.avatarSizes.sm} />
          <Text variant="bodySm" color="tertiary">
            Created by {owner?.name}
          </Text>
        </Row>

        <Divider style={{ marginVertical: theme.spacing.sm }} />

        {/* Stats row */}
        <Row justify="space-evenly">
          <Stack align="center">
            <Text variant="displaySm" color="primary">
              {link.locations.length}
            </Text>
            <Text variant="bodySm" color="tertiary">
              Location{link.locations.length !== 1 ? 's' : ''}
            </Text>
          </Stack>
          <View style={styles.statDivider} />
          <Stack align="center">
            <Text variant="displaySm" color="primary">
              {link.mediaCount}
            </Text>
            <Text variant="bodySm" color="tertiary">
              Item{link.mediaCount !== 1 ? 's' : ''}
            </Text>
          </Stack>
        </Row>
      </CardSection>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.borderLight,
    alignSelf: 'stretch',
  },
}));
