import { useCallback, useRef, useState } from 'react';
import * as Burnt from 'burnt';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

export type CapturedAsset = {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
};

export function useVisionCamera() {
  const cameraRef = useRef<Camera>(null);
  const [capturedAsset, setCapturedAsset] = useState<CapturedAsset | null>(
    null,
  );
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const device = useCameraDevice(cameraPosition);

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  const photoFormat = useCameraFormat(device, [
    { photoAspectRatio: 4 / 3 },
    { videoAspectRatio: 4 / 3 },
    { videoResolution: 'max' },
    { photoResolution: 'max' },
  ]);
  const videoFormat = useCameraFormat(device, [
    { videoAspectRatio: 16 / 9 },
    { fps: 30 },
  ]);

  const format = captureMode === 'photo' ? photoFormat : videoFormat;
  const previewRatio = captureMode === 'photo' ? 3 / 4 : 9 / 16;

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePhoto();
    setCapturedAsset({
      uri: `file://${photo.path}`,
      type: 'image',
      width: photo.width,
      height: photo.height,
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);

    cameraRef.current.startRecording({
      onRecordingFinished: (video) => {
        setCapturedAsset({
          uri: `file://${video.path}`,
          type: 'video',
          width: video.width,
          height: video.height,
          duration: video.duration,
        });
        setIsRecording(false);
      },
      onRecordingError: () => {
        setIsRecording(false);
        Burnt.toast({
          title: 'Recording failed',
          preset: 'error',
          haptic: 'error',
        });
      },
    });
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecording) return;
    await cameraRef.current.stopRecording();
  }, [isRecording]);

  const toggleCameraPosition = useCallback(() => {
    setCameraPosition((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  return {
    cameraRef,
    device,
    cameraPosition,
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
  };
}
