import { Image } from 'expo-image';
import { ReactNode, useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Spinner } from './Loading';

interface MediaTileProps {
  uri: string | null;
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
  const { theme } = useUnistyles();

  const [isLoaded, setIsLoaded] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View
        style={[
          { width, height, opacity: pressed ? theme.opacity.pressed : 1 },
          containerStyle,
        ]}
      >
        {uri && (
          <Image
            source={{ uri }}
            style={{ width, height, borderRadius }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            onLoad={() => setIsLoaded(true)}
          />
        )}

        <View style={styles.overlay}>
          {isLoaded ? (
            renderOverlay?.(isLoaded)
          ) : (
            <View
              style={[
                styles.overlay,
                { backgroundColor: theme.colors.lightGray, borderRadius },
              ]}
            >
              <Spinner />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create(() => ({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
