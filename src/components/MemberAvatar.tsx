import { View } from 'react-native';
import { Text } from './';
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
        <Text variant="labelMd" color="primary">
          {member.name ?? member.username ?? 'Unknown'}
        </Text>
        {member.username && (
          <Text variant="bodySm" color="tertiary">
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
  },
}));
