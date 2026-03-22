import { Pressable, View, Text, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import Button from '../../../components/Button';
import { ActiveFeedLink } from '../../../lib/models';
import { formatRelativeTime } from '../../../lib/utils/formatTime';

interface Props {
  peek?: boolean;
  link: ActiveFeedLink;
  isMember?: boolean;
  onPress: () => void;
  onJoin: () => void;
}

const AVATAR_SIZE = 40;

export default function ActiveLinkCard({
  peek = false,
  link,
  isMember,
  onPress,
  onJoin,
}: Props) {
  const theme = UnistylesRuntime.getTheme();
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const HORIZONTAL_PADDING = theme.spacing.md * 2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? theme.opacity.pressed : 1,
      })}
    >
      <View
        style={[
          styles.card,
          peek && { width: SCREEN_WIDTH - HORIZONTAL_PADDING - 80 },
        ]}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          {link.party.avatarUrl ? (
            <Image
              source={{ uri: link.party.avatarUrl }}
              style={styles.avatar}
              cachePolicy="memory-disk"
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <MaterialIcons name="group" size={16} color={theme.colors.gray} />
            </View>
          )}

          <View style={styles.textWrap}>
            <Text style={styles.linkName} numberOfLines={1}>
              {link.name}
            </Text>
            <Text style={styles.partyName} numberOfLines={1}>
              with {link.party.name}
            </Text>
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="access-time"
                size={12}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.metaText}>
                {formatRelativeTime(link.created_at)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="people-outline"
                size={12}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.metaText}>{link.members.length}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="image"
                size={12}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.metaText}>{link.mediaCount}</Text>
            </View>
          </View>

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
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.badgeActive,
    gap: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: theme.radii.full,
  },
  avatarFallback: {
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  linkName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  partyName: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
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
    gap: 4,
  },
  metaText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
  },
}));
