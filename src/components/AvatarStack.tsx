import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AvatarStackProps {
  avatarUris: string[];
  maxVisible?: number;
  size?: number;
}

export default function AvatarStack({
  avatarUris,
  maxVisible = 5,
  size,
}: AvatarStackProps) {
  const { theme } = useUnistyles();

  const avatarSize = size ?? theme.avatarSizes.md;
  const total = avatarUris.length;
  const visible = Math.min(maxVisible, total);
  const overflow = total - visible;
  const displayed = avatarUris.slice(0, visible);

  return (
    <View style={styles.row}>
      {displayed.map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          cachePolicy="memory-disk"
          style={styles.image(size, i)}
        />
      ))}

      {overflow > 0 && (
        <View style={styles.overflowBadge(avatarSize)}>
          <Text style={styles.overflowText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: (size: number, index: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1,
    borderColor: theme.colors.white,
    marginLeft: index > 0 ? -size / 4 : 0,
  }),
  overflowBadge: (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1,
    marginLeft: -size / 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.lightGray,
    borderColor: theme.colors.white,
  }),
  overflowText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.darkGray,
  },
}));
