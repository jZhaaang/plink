import { Feather } from '@expo/vector-icons';
import { ActivityFeedItem } from '../../../lib/models';
import { View, Text } from 'react-native';
import { activityLine } from '../hooks/useActivityFeed';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Card, CardSection } from '../../../components';

interface Props {
  item: ActivityFeedItem;
  onPress?: () => void;
}

function iconForType(
  type: ActivityFeedItem['type'],
): keyof typeof Feather.glyphMap {
  switch (type) {
    case 'link_created':
      return 'plus-circle';
    case 'link_ended':
      return 'check-circle';
    case 'link_member_joined':
      return 'user-plus';
    case 'link_member_left':
      return 'user-minus';
    case 'party_member_joined':
      return 'users';
    case 'party_member_left':
      return 'user-x';
    default:
      return 'bell';
  }
}

export default function ActivityCard({ item, onPress }: Props) {
  const { theme } = useUnistyles();

  return (
    <Card onPress={onPress} style={styles.card}>
      <CardSection style={styles.cardSection}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Feather
              name={iconForType(item.type)}
              size={theme.iconSizes.sm}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.activityText}>{activityLine(item)}</Text>
            <Text style={styles.timeText}>
              {formatRelativeTime(item.created_at)}
            </Text>
          </View>

          {!item.read_at ? <View style={styles.unreadDot} /> : null}
        </View>
      </CardSection>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginBottom: theme.spacing.sm,
  },
  cardSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPlaceholder,
    marginTop: theme.spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.info,
    marginTop: theme.spacing.xs,
  },
}));
