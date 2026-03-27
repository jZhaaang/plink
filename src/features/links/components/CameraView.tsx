import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVisionCamera } from '../hooks/useVisionCamera';
import { Pressable, View, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Camera } from 'react-native-vision-camera';
import { Feather, Ionicons } from '@expo/vector-icons';

interface Props {
  camera: ReturnType<typeof useVisionCamera>;
  onClose: () => void;
}

export function CameraView({ camera, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const controlsBottom = insets.bottom + 24;

  return (
    <View style={styles.container}>
      {/* Camera preview */}
      <View style={styles.previewBox}>
        <Camera
          ref={camera.cameraRef}
          style={StyleSheet.absoluteFill}
          device={camera.device!}
          format={camera.format}
          isActive
          photo
          video
          audio
          resizeMode="cover"
          zoom={camera.zoom}
          outputOrientation="device"
        />
      </View>

      {/* Close */}
      <Pressable
        onPress={onClose}
        style={{ position: 'absolute', top: insets.top + 12, left: 16 }}
      >
        <View style={styles.circleButton}>
          <Feather
            name="x"
            size={theme.iconSizes.lg}
            color={theme.colors.white}
          />
        </View>
      </Pressable>

      {/* Flip camera */}
      <Pressable
        onPress={camera.toggleCameraPosition}
        style={{ position: 'absolute', top: insets.top + 12, right: 16 }}
      >
        <View style={styles.circleButton}>
          <Ionicons
            name="camera-reverse"
            size={theme.iconSizes.lg}
            color={theme.colors.white}
          />
        </View>
      </Pressable>

      {/* Zoom selector */}
      {camera.zoomStops.length > 1 && (
        <View style={[styles.bottomRow, { bottom: controlsBottom + 170 }]}>
          {camera.zoomStops.map((stop) => (
            <Pressable
              key={stop.value}
              onPress={() => camera.setZoom(stop.value)}
            >
              <View
                style={[
                  styles.zoomPill,
                  camera.zoom === stop.value && styles.zoomPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.zoomText,
                    camera.zoom === stop.value && styles.zoomTextActive,
                  ]}
                >
                  {stop.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Shutter */}
      <View style={[styles.bottomRow, { bottom: controlsBottom + 80 }]}>
        <Pressable
          onPress={() => {
            if (camera.captureMode === 'photo') {
              camera.takePhoto();
            } else if (camera.isRecording) {
              camera.stopRecording();
            } else {
              camera.startRecording();
            }
          }}
        >
          <View style={styles.shutterOuter}>
            <View
              style={[
                styles.shutterInner,
                camera.isRecording && styles.shutterRecording,
              ]}
            />
          </View>
        </Pressable>
      </View>

      {/* Mode toggle */}
      <View style={[styles.bottomRow, { bottom: controlsBottom }]}>
        <View style={styles.modeToggle}>
          <Pressable
            disabled={camera.isRecording}
            onPress={() => camera.setCaptureMode('photo')}
          >
            <View
              style={[
                styles.modeOption,
                camera.captureMode === 'photo' && styles.modeOptionActive,
              ]}
            >
              <Text
                style={
                  camera.captureMode === 'photo'
                    ? styles.modeTextActive
                    : styles.modeTextInactive
                }
              >
                Photo
              </Text>
            </View>
          </Pressable>

          <Pressable
            disabled={camera.isRecording}
            onPress={() => camera.setCaptureMode('video')}
          >
            <View
              style={[
                styles.modeOption,
                camera.captureMode === 'video' && styles.modeOptionActive,
              ]}
            >
              <Text
                style={
                  camera.captureMode === 'video'
                    ? styles.modeTextActive
                    : styles.modeTextInactive
                }
              >
                Video
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    ...StyleSheet.absoluteFillObject,
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
  bottomRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.full,
    borderWidth: 4,
    borderColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.white,
  },
  shutterRecording: {
    backgroundColor: '#ef4444',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: theme.radii.full,
    padding: theme.spacing.xs,
  },
  modeOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
  },
  modeOptionActive: {
    backgroundColor: theme.colors.white,
  },
  modeTextActive: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.semibold,
  },
  modeTextInactive: {
    color: theme.colors.white,
  },
  zoomPill: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomPillActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  zoomText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
  },
  zoomTextActive: {
    color: '#fbbf24',
    fontWeight: theme.fontWeights.bold,
  },
}));
