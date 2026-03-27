import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Profile } from '../lib/models';

interface Props {
  member: Profile;
  size?: number;
}

export default function MemberAvatar({ member, size }: Props) {
  const { theme } = useUnistyles();
  const avatarSize = size ?? theme.avatarSizes.md;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: member.avatarUrl }}
        cachePolicy="memory-disk"
        style={styles.avatar(avatarSize)}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name ?? member.username ?? 'Unknown'}
        </Text>
        {member.username && (
          <Text style={styles.username} numberOfLines={1}>
            @{member.username}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: (size: number) => ({
    width: size,
    height: size,
    borderRadius: theme.radii.full,
  }),
  info: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  name: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  username: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 1,
  },
}));
