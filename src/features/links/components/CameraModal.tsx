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

type Props = {
  visible: boolean;
  initialMode: 'photo' | 'video';
  onCapture: (assets: ImagePicker.ImagePickerAsset[]) => void;
  onClose: () => void;
};

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
        <View className="flex-1 bg-black items-center justify-center">
          <Text className="text-white text-base">
            Camera permissions required
          </Text>
          <Pressable
            onPress={() => {
              requestCameraPermission();
              requestMicrophonePermission();
            }}
            className="mt-4 px-5 py-3 bg-blue-600 rounded-lg"
          >
            <Text className="text-white font-semibold">Grant</Text>
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
        <View className="flex-1 bg-black items-center justify-center">
          <Text className="text-white text-base">Loading camera...</Text>
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
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />

        {/* Camera layer — always rendered */}
        <View className="absolute inset-0">
          {/* Top bar */}
          <View
            className="absolute top-0 left-0 right-0 bg-black"
            style={{ height: topBarHeight }}
          >
            <Pressable
              onPress={
                capturedAsset ? () => setCapturedAsset(null) : handleClose
              }
              className="absolute left-4 p-2 bg-black/40 rounded-full"
              style={{ top: insets.top + 12 }}
            >
              <Feather name="x" size={24} color="white" />
            </Pressable>

            {!capturedAsset && (
              <Pressable
                onPress={toggleCameraPosition}
                className="absolute right-4 p-2 bg-black/40 rounded-full"
                style={{ top: insets.top + 12 }}
              >
                <Feather name="refresh-cw" size={22} color="white" />
              </Pressable>
            )}
          </View>

          {/* Camera preview — stays mounted */}
          <View
            className="absolute left-0 right-0 overflow-hidden bg-black"
            style={{ top: previewTop, height: previewHeight }}
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
            className="absolute left-0 right-0 items-center"
            style={{ bottom: controlsBottom + 80 }}
          >
            <Pressable
              onPress={captureMode === 'photo' ? takePhoto : undefined}
              onPressIn={captureMode === 'video' ? startRecording : undefined}
              onPressOut={captureMode === 'video' ? stopRecording : undefined}
              className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
            >
              <View
                className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white'}`}
              />
            </Pressable>
          </View>

          {/* Mode toggle */}
          {!capturedAsset && (
            <View
              className="absolute left-0 right-0 items-center"
              style={{ bottom: controlsBottom }}
            >
              <View className="mt-4 flex-row bg-black/40 rounded-full p-1">
                <Pressable
                  disabled={isRecording}
                  onPress={() => setCaptureMode('photo')}
                  className={`px-4 py-2 rounded-full ${captureMode === 'photo' ? 'bg-white' : ''}`}
                >
                  <Text
                    className={
                      captureMode === 'photo'
                        ? 'text-black font-semibold'
                        : 'text-white'
                    }
                  >
                    Photo
                  </Text>
                </Pressable>

                <Pressable
                  disabled={isRecording}
                  onPress={() => setCaptureMode('video')}
                  className={`px-4 py-2 rounded-full ${captureMode === 'video' ? 'bg-white' : ''}`}
                >
                  <Text
                    className={
                      captureMode === 'video'
                        ? 'text-black font-semibold'
                        : 'text-white'
                    }
                  >
                    Video
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Preview layer — overlaid on top when asset exists */}
        {capturedAsset && (
          <View className="absolute inset-0">
            <View
              className="absolute left-0 right-0 overflow-hidden bg-transparent"
              style={{ top: previewTop, height: previewHeight }}
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
            <Pressable
              onPress={() => setCapturedAsset(null)}
              className="absolute left-4 p-2 bg-black/40 rounded-full"
              style={{ top: insets.top + 12 }}
            >
              <Feather name="x" size={24} color="white" />
            </Pressable>

            {/* Confirm button — same position as shutter */}
            <View
              className="absolute left-0 right-0 items-center"
              style={{ bottom: controlsBottom + 80 }}
            >
              <Pressable
                onPress={handleConfirm}
                className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center"
              >
                <Feather name="send" size={28} color="white" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
