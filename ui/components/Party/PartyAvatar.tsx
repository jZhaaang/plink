import { Image } from 'expo-image';
import { StyleProp, View, ViewStyle } from 'react-native';

type Props = {
  uri: string;
  size?: number;
  border?: number;
  style?: StyleProp<ViewStyle>;
};

export function PartyAvatar({ uri, size = 64, border = 4, style }: Props) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: border,
          borderColor: 'white',
          overflow: 'hidden',
          backgroundColor: '#ccc',
        },
        style,
      ]}
    >
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
    </View>
  );
}
