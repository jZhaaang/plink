import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

interface JoinLinkBannerProps {
  onJoin: () => void;
  memberCount: number;
}

export default function JoinLinkBanner({
  onJoin,
  memberCount,
}: JoinLinkBannerProps) {
  const theme = UnistylesRuntime.getTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.title}>Join this link</Text>
        <Text style={styles.subtitle}>
          <Feather name="users" size={12} color={theme.colors.textTertiary} />{' '}
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </Text>
      </View>
      <Pressable onPress={onJoin}>
        <View style={styles.joinButton}>
          <Feather name="log-in" size={20} color="white" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    bottom: theme.spacing['3xl'],
    left: theme.spacing['2xl'],
    right: theme.spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    ...theme.shadows.lg,
  },
  textColumn: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  joinButton: {
    width: 48,
    height: 40,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
