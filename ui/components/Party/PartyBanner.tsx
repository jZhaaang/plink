import { Image } from 'expo-image';
import { View } from 'react-native';

export function PartyBanner({ uri }: { uri: string }) {
  return (
    <View className="w-full h-28 bg-gray-200 relative">
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
    </View>
  );
}
