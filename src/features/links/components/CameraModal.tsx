import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logger } from '../../../lib/supabase/logger';
import {
  ActivityIndicator,
  View,
  Text,
  StatusBar,
  Pressable,
  Modal,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';

type CapturedAsset = {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
};

type Props = {
  visible: boolean;
  onCapture: (assets: ImagePicker.ImagePickerAsset[]) => void;
  onClose: () => void;
};

const MODES = ['Photo', 'Video'] as const;
const DEFAULT_MODE = 'picture' as const;
const DEFAULT_FACING = 'back' as const;

export default function CameraModal({ visible, onCapture, onClose }: Props) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<'front' | 'back'>(DEFAULT_FACING);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'picture' | 'video' | 'preview'>(
    DEFAULT_MODE,
  );
  const [capturedAsset, setCapturedAsset] = useState<CapturedAsset | null>(
    null,
  );

  const cameraRef = useRef<CameraView>(null);
  const recordingScale = useSharedValue(1);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (!micPermission?.granted) {
      requestMicPermission();
    }
  }, [
    visible,
    cameraPermission?.granted,
    micPermission?.granted,
    requestCameraPermission,
    requestMicPermission,
  ]);

  const resetModalState = () => {
    setIsRecording(false);
    setCapturedAsset(null);
    setMode(DEFAULT_MODE);
    setFacing(DEFAULT_FACING);
    recordingScale.value = withSpring(1, { damping: 50, stiffness: 150 });
  };

  useEffect(() => {
    if (!visible) {
      resetModalState();
    }
  }, [visible]);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        exif: false,
      });

      if (photo) {
        setCapturedAsset({
          uri: photo.uri,
          type: 'image',
          width: photo.width,
          height: photo.height,
        });
        setMode('preview');
      }
    } catch (err) {
      logger.error('Failed to take picture:', getErrorMessage(err));
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    recordingScale.value = withSpring(1.2, { damping: 50, stiffness: 150 });

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 120,
      });

      if (video) {
        setCapturedAsset({
          uri: video.uri,
          type: 'video',
        });
        setMode('preview');
      }
    } catch (err) {
      logger.error('Failed to record video:', getErrorMessage(err));
      setMode('picture');
    } finally {
      setIsRecording(false);
      recordingScale.value = withSpring(1, { damping: 50, stiffness: 150 });
    }
  };

  const stopRecording = () => {
    if (!cameraRef.current) return;

    setIsRecording(false);
    recordingScale.value = withSpring(1, { damping: 50, stiffness: 150 });
    cameraRef.current.stopRecording();
  };

  const handleCapture = () => {
    if (mode === 'picture') {
      takePicture();
    } else if (mode === 'video') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const handleConfirm = () => {
    if (!capturedAsset) return;

    const asset: ImagePicker.ImagePickerAsset = {
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
    };

    onCapture([asset]);
    resetModalState();
    onClose();
  };

  const handleRetake = () => {
    setCapturedAsset(null);
    setMode(capturedAsset?.type === 'video' ? 'video' : DEFAULT_MODE);
  };

  const handleClose = () => {
    if (isRecording && cameraRef.current) {
      cameraRef.current.stopRecording();
    }
    resetModalState();
    onClose();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingScale.value }],
  }));

  if (!cameraPermission || !micPermission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <StatusBar barStyle="light-content" />
        <Feather name="camera-off" size={64} color="white" />
        <Text className="text-white text-lg font-semibold mt-6 text-center">
          Camera & Microphone Access Required
        </Text>
        <Text className="text-white/60 text-sm mt-2 text-center">
          Please grant permissions to capture photos and videos
        </Text>
        <Pressable
          onPress={() => {
            requestCameraPermission();
            requestMicPermission();
          }}
          className="mt-8 px-6 py-3 bg-blue-600 rounded-xl active:bg-blue-700"
        >
          <Text className="text-white font-semibold">Grant Permissions</Text>
        </Pressable>
        <Pressable onPress={handleClose} className="mt-4">
          <Text className="text-white/60">Cancel</Text>
        </Pressable>
      </View>
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

        {mode !== 'preview' ? (
          <View className="flex-1">
            <View className="flex-1 items-center justify-center">
              <CameraView
                ref={cameraRef}
                style={{ width: '100%', aspectRatio: 3 / 4 }}
                facing={facing}
                mode={mode}
              />
            </View>

            {/* Top Controls — now outside CameraView, positioned over full screen */}
            <View
              className="absolute top-0 left-0 right-0 z-10 px-4"
              style={{ paddingTop: insets.top + 8 }}
            >
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={handleClose}
                  className="p-2 bg-black/30 rounded-full"
                >
                  <Feather name="x" size={24} color="white" />
                </Pressable>

                <Pressable
                  onPress={() =>
                    setFacing((f) => (f === 'back' ? 'front' : 'back'))
                  }
                  className="p-2 bg-black/30 rounded-full"
                >
                  <Ionicons name="camera-reverse" size={24} color="white" />
                </Pressable>
              </View>
            </View>

            {/* Bottom Controls */}
            <View
              className="absolute bottom-0 left-0 right-0 items-center"
              style={{ paddingBottom: insets.bottom + 32, overflow: 'visible' }}
            >
              <View className="flex-row justify-center gap-6 mb-4">
                {MODES.map((m) => {
                  const isSelected =
                    (m === 'Photo' && mode === 'picture') ||
                    (m === 'Video' && mode === 'video');
                  return (
                    <Pressable
                      key={m}
                      disabled={isRecording}
                      onPress={() =>
                        setMode(m === 'Photo' ? 'picture' : 'video')
                      }
                    >
                      <Text
                        className={`text-sm font-semibold ${isSelected ? 'text-yellow-400' : 'text-white/50'}`}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {/* Capture Button */}
              <Pressable onPress={handleCapture}>
                <Animated.View style={buttonStyle}>
                  <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
                    <View
                      style={{
                        width: isRecording ? 28 : 64,
                        height: isRecording ? 28 : 64,
                        borderRadius: isRecording ? 6 : 32,
                        backgroundColor: isRecording ? '#ef4444' : 'white',
                      }}
                    />
                  </View>
                </Animated.View>
              </Pressable>
            </View>
          </View>
        ) : capturedAsset ? (
          <PreviewView
            asset={capturedAsset}
            onConfirm={handleConfirm}
            onRetake={handleRetake}
            insets={insets}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </View>
    </Modal>
  );
}

type PreviewProps = {
  asset: CapturedAsset;
  onConfirm: () => void;
  onRetake: () => void;
  insets: { top: number; bottom: number };
};

function PreviewView({ asset, onConfirm, onRetake, insets }: PreviewProps) {
  const player = useVideoPlayer(
    asset.type === 'video' ? asset.uri : null,
    (p) => {
      if (asset.type === 'video') {
        p.loop = true;
        p.play();
      }
    },
  );

  return (
    <View className="flex-1 bg-black">
      {/* Media Preview */}
      <View className="flex-1 items-center justify-center">
        {asset.type === 'video' ? (
          <VideoView
            player={player!}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: asset.uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            transition={200}
          />
        )}
      </View>

      {/* Bottom Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 px-8"
        style={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="flex-row items-center justify-center gap-12">
          {/* Retake Button */}
          <Pressable onPress={onRetake} className="items-center">
            <View className="w-16 h-16 rounded-full bg-black/50 items-center justify-center border-2 border-white/30">
              <Feather name="x" size={28} color="white" />
            </View>
            <Text className="text-white text-xs mt-2">Retake</Text>
          </Pressable>

          {/* Confirm Button */}
          <Pressable onPress={onConfirm} className="items-center">
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center">
              <Feather name="check" size={32} color="white" />
            </View>
            <Text className="text-white text-xs mt-2">Use</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
