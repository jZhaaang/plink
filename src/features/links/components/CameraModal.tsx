import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useVisionCamera } from '../hooks/useVisionCamera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  initialMode: 'photo' | 'video';
  onCapture: (assets: ImagePicker.ImagePickerAsset[]) => void;
  onClose: () => void;
}

export default function CameraModal({
  visible,
  initialMode,
  onCapture,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const {
    cameraRef,
    device,
    toggleCameraPosition,
    captureMode,
    setCaptureMode,
    previewRatio,
    format,
    isRecording,
    capturedAsset,
    setCapturedAsset,
    hasCameraPermission,
    hasMicrophonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
    takePhoto,
    startRecording,
    stopRecording,
  } = useVisionCamera();
  const capturedVideoPlayer = useVideoPlayer(
    capturedAsset?.type === 'video' ? { uri: capturedAsset.uri } : null,
    (player) => {
      player.loop = true;
      player.play();
    },
  );

  useEffect(() => {
    if (!visible) return;
    if (!hasCameraPermission) requestCameraPermission();
    if (!hasMicrophonePermission) requestMicrophonePermission();
  }, [
    visible,
    hasCameraPermission,
    hasMicrophonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
  ]);

  useEffect(() => {
    if (!visible) return;
    setCaptureMode(initialMode);
  }, [visible, initialMode, setCaptureMode]);

  const maxPreviewHeight = screenHeight - (insets.top + insets.bottom + 180);
  const previewHeight = Math.min(screenWidth / previewRatio, maxPreviewHeight);

  const topBarHeight = insets.top + 56;
  const controlsBottom = insets.bottom + 24;
  const previewTop = topBarHeight;

  const handleConfirm = () => {
    if (!capturedAsset) return;
    onCapture([
      {
        uri: capturedAsset.uri,
        type: capturedAsset.type,
        width: capturedAsset.width ?? 0,
        height: capturedAsset.height ?? 0,
        duration: capturedAsset.duration,
        assetId: null,
        fileName: null,
        fileSize: null,
        mimeType: capturedAsset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        base64: null,
        exif: null,
      },
    ]);
    setCapturedAsset(null);
    onClose();
  };

  const handleClose = () => {
    setCapturedAsset(null);
    onClose();
  };

  if (!hasCameraPermission || !hasMicrophonePermission) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.fullscreenBlack}>
          <Text style={styles.permText}>Camera permissions required</Text>
          <Pressable
            onPress={() => {
              requestCameraPermission();
              requestMicrophonePermission();
            }}
          >
            <View style={styles.grantButton}>
              <Text style={styles.grantText}>Grant</Text>
            </View>
          </Pressable>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.fullscreenBlack}>
          <Text style={styles.permText}>Loading camera...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />

        {/* Camera layer — always rendered */}
        <View style={styles.absoluteFill}>
          {/* Top bar */}
          <View
            style={[styles.topBar, { height: topBarHeight }]}
          >
            <Pressable
              onPress={
                capturedAsset ? () => setCapturedAsset(null) : handleClose
              }
            >
              <View style={[styles.circleButton, { top: insets.top + 12, left: 16, position: 'absolute' }]}>
                <Feather name="x" size={24} color="white" />
              </View>
            </Pressable>

            {!capturedAsset && (
              <Pressable onPress={toggleCameraPosition}>
                <View style={[styles.circleButton, { top: insets.top + 12, right: 16, position: 'absolute' }]}>
                  <Feather name="refresh-cw" size={22} color="white" />
                </View>
              </Pressable>
            )}
          </View>

          {/* Camera preview */}
          <View
            style={[styles.previewWrap, { top: previewTop, height: previewHeight }]}
          >
            <Camera
              ref={cameraRef}
              style={{ flex: 1 }}
              device={device}
              format={format}
              isActive={visible && !capturedAsset}
              photo
              video
              audio
              resizeMode="cover"
              zoom={device.neutralZoom}
            />
          </View>

          {/* Shutter button */}
          <View
            style={[styles.shutterRow, { bottom: controlsBottom + 80 }]}
          >
            <Pressable
              onPress={captureMode === 'photo' ? takePhoto : undefined}
              onPressIn={captureMode === 'video' ? startRecording : undefined}
              onPressOut={captureMode === 'video' ? stopRecording : undefined}
            >
              <View style={styles.shutterOuter}>
                <View
                  style={[
                    styles.shutterInner,
                    isRecording && styles.shutterRecording,
                  ]}
                />
              </View>
            </Pressable>
          </View>

          {/* Mode toggle */}
          {!capturedAsset && (
            <View
              style={[styles.modeToggleRow, { bottom: controlsBottom }]}
            >
              <View style={styles.modeToggle}>
                <Pressable
                  disabled={isRecording}
                  onPress={() => setCaptureMode('photo')}
                >
                  <View
                    style={[
                      styles.modeOption,
                      captureMode === 'photo' && styles.modeOptionActive,
                    ]}
                  >
                    <Text
                      style={
                        captureMode === 'photo'
                          ? styles.modeTextActive
                          : styles.modeTextInactive
                      }
                    >
                      Photo
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  disabled={isRecording}
                  onPress={() => setCaptureMode('video')}
                >
                  <View
                    style={[
                      styles.modeOption,
                      captureMode === 'video' && styles.modeOptionActive,
                    ]}
                  >
                    <Text
                      style={
                        captureMode === 'video'
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
          )}
        </View>

        {/* Preview layer — overlaid on top when asset exists */}
        {capturedAsset && (
          <View style={styles.absoluteFill}>
            <View
              style={[styles.previewWrapTransparent, { top: previewTop, height: previewHeight }]}
            >
              {capturedAsset.type === 'video' ? (
                <VideoView
                  player={capturedVideoPlayer}
                  style={{ flex: 1 }}
                  contentFit="cover"
                  nativeControls={false}
                  allowsFullscreen={false}
                />
              ) : (
                <Image
                  source={{ uri: capturedAsset.uri }}
                  style={{ flex: 1 }}
                  contentFit="cover"
                />
              )}
            </View>

            {/* X button to discard */}
            <Pressable onPress={() => setCapturedAsset(null)}>
              <View style={[styles.circleButton, { position: 'absolute', left: 16, top: insets.top + 12 }]}>
                <Feather name="x" size={24} color="white" />
              </View>
            </Pressable>

            {/* Confirm button */}
            <View
              style={[styles.shutterRow, { bottom: controlsBottom + 80 }]}
            >
              <Pressable onPress={handleConfirm}>
                <View style={styles.confirmButton}>
                  <Feather name="send" size={28} color="white" />
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  fullscreenBlack: {
    flex: 1,
    backgroundColor: theme.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.base,
  },
  grantButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
  },
  grantText: {
    color: theme.colors.textInverse,
    fontWeight: theme.fontWeights.semibold,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.black,
  },
  circleButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: theme.radii.full,
  },
  previewWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: theme.colors.black,
  },
  previewWrapTransparent: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  shutterRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
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
  modeToggleRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modeToggle: {
    marginTop: theme.spacing.lg,
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
  confirmButton: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
