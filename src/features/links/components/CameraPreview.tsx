import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { CapturedAsset } from '../hooks/useVisionCamera';

interface Props {
  asset: CapturedAsset;
  onDiscard: () => void;
  onConfirm: () => void;
}

export function CameraPreview({ asset, onDiscard, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const player = useVideoPlayer(
    asset.type === 'video' ? { uri: asset.uri } : null,
    (p) => {
      p.loop = true;
      p.play();
    },
  );

  const controlsBottom = insets.bottom + 24;

  return (
    <View style={styles.container}>
      <View style={styles.previewBox}>
        {asset.type === 'video' ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: asset.uri }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
          />
        )}
      </View>

      {/* Discard */}
      <Pressable
        onPress={onDiscard}
        style={{ position: 'absolute', left: 16, top: insets.top + 12 }}
      >
        <View style={styles.circleButton}>
          <Feather
            name="x"
            size={theme.iconSizes.lg}
            color={theme.colors.white}
          />
        </View>
      </Pressable>

      {/* Confirm */}
      <View style={[styles.confirmRow, { bottom: controlsBottom + 80 }]}>
        <Pressable onPress={onConfirm}>
          <View style={styles.confirmButton}>
            <Feather
              name="send"
              size={theme.iconSizes.lg}
              color={theme.colors.white}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBox: {
    width: '100%',
    aspectRatio: 9 / 16,
    overflow: 'hidden',
  },
  circleButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: theme.radii.full,
  },
  confirmRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  confirmButton: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
