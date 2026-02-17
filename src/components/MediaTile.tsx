import { Image } from 'expo-image';
import { memo, ReactNode, useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

type Props = {
  uri: string;
  width: number;
  height: number;
  borderRadius?: number;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  renderOverlay?: (isLoaded: boolean) => ReactNode;
};

export function MediaTile({
  uri,
  width,
  height,
  borderRadius = 12,
  onPress,
  containerStyle,
  renderOverlay,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80"
      style={[{ width, height }, containerStyle]}
    >
      <Image
        source={{ uri }}
        style={{ width, height, borderRadius }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        onLoad={() => setIsLoaded(true)}
      />

      {!isLoaded && (
        <View
          className="absolute inset-0 bg-slate-300/70"
          style={{ borderRadius }}
        />
      )}

      {renderOverlay?.(isLoaded)}
    </Pressable>
  );
}

export default memo(MediaTile);
