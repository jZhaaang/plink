import { Image } from 'expo-image';
import { ReactNode, useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface MediaTileProps {
  uri: string;
  width: number;
  height: number;
  borderRadius?: number;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  renderOverlay?: (isLoaded: boolean) => ReactNode;
}

export default function MediaTile({
  uri,
  width,
  height,
  borderRadius = 12,
  onPress,
  containerStyle,
  renderOverlay,
}: MediaTileProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [pressed, setPressed] = useState(false);

  styles.useVariants({ pressed });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={[styles.wrapper, { width, height }, containerStyle]}>
        <Image
          source={{ uri }}
          style={{ width, height, borderRadius }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          onLoad={() => setIsLoaded(true)}
        />

        {!isLoaded && (
          <View style={[styles.loadingPlaceholder, { borderRadius }]} />
        )}

        {renderOverlay?.(isLoaded)}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    variants: {
      pressed: {
        true: { opacity: theme.opacity.pressed },
        false: {},
      },
    },
  },
  loadingPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.lightGray,
  },
}));
