import { Image } from 'expo-image';
import { Text, View } from 'react-native';

type Props = {
  uris: string[];
  size?: number;
  border?: number;
  condensed?: boolean;
};

export function MemberAvatarStack({ uris, size = 32, border = 1, condensed = true }: Props) {
  const displayed = condensed ? uris : uris.slice(0, 3);
  const extraCount = uris.length - 3;

  return (
    <View className="flex-row items-center">
      {displayed.map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: i > 0 ? -size / 3 : 0,
            borderWidth: border,
            borderColor: 'white',
          }}
        />
      ))}

      {condensed && extraCount > 0 && (
        <View
          className="items-center justify-center bg-gray-300 border-white"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: border,
            marginLeft: -size / 3,
          }}
        >
          <Text className="text-xs font-bold text-gray-700">+{extraCount}</Text>
        </View>
      )}
    </View>
  );
}
