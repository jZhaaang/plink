import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export function PartyBanner({ uri }: { uri: string }) {
  return (
    <View className="w-full h-28 bg-gray-200 relative">
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      <LinearGradient
        colors={['#00000033', 'transparent']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
        }}
      />
    </View>
  );
}
