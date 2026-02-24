import { Feather } from '@expo/vector-icons';
import { ActivityFeedItem } from '../../../lib/models';
import { Pressable, View, Text } from 'react-native';
import { activityLine } from '../hooks/useActivityFeed';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import { memo, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

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

export function ActivityListItem({ item, onPress }: Props) {
  const [pressed, setPressed] = useState(false);

  styles.useVariants({ pressed });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Feather name={iconForType(item.type)} size={16} color="#2563eb" />
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.activityText}>{activityLine(item)}</Text>
            <Text style={styles.timeText}>
              {formatRelativeTime(item.created_at)}
            </Text>
          </View>

          {!item.read_at ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ActivityListItem);

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    variants: {
      pressed: {
        true: { opacity: 0.8 },
        false: {},
      },
    },
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
