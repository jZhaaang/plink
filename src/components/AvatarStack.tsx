import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { memo } from 'react';

type Props = {
  avatarUris: string[];
  maxVisible?: number;
  size?: number;
  className?: string;
};

export function AvatarStack({ avatarUris, maxVisible = 5, size = 40 }: Props) {
  const total = avatarUris.length;
  const visible = Math.min(maxVisible, total);
  const overflow = total - visible;

  const displayed = avatarUris.slice(0, visible);

  return (
    <View className="flex-row items-center">
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
          className="items-center justify-center bg-gray-300 border-white"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            marginLeft: -size / 3,
          }}
        >
          <Text className="text-xs font-bold text-gray-700">+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

export default memo(AvatarStack);
