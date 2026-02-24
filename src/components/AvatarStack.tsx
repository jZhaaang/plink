import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet } from 'react-native-unistyles';

interface AvatarStackProps {
  avatarUris: string[];
  maxVisible?: number;
  size?: number;
}

export function AvatarStack({
  avatarUris,
  maxVisible = 5,
  size = 40,
}: AvatarStackProps) {
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
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: 'white',
            marginLeft: i > 0 ? -size / 3 : 0,
          }}
        />
      ))}

      {overflow > 0 && (
        <View
          style={[
            styles.overflowBadge,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1,
              marginLeft: -size / 3,
            },
          ]}
        >
          <Text style={styles.overflowText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

export default memo(AvatarStack);

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overflowBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: theme.colors.lightGray,
    borderColor: theme.colors.white,
  },
  overflowText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.darkGray,
  },
}));
