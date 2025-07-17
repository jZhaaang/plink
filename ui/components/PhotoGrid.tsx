import { Image } from 'expo-image';
import { View } from 'react-native';

type Props = {
  uris: string[];
  width?: number;
  height?: number;
};

export function PhotoGrid({ uris, width = 96, height = 96 }: Props) {
  return (
    <View className="flex-row gap-2 px-4 pb-2">
      {uris.map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          style={{ width, height, borderRadius: 8 }}
          contentFit="cover"
        />
      ))}
    </View>
  );
}
