import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const isRecordingRef = useRef(false);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: [
      'ultra-wide-angle-camera',
      'wide-angle-camera',
      'telephoto-camera',
    ],
  });

  const [zoom, setZoom] = useState<number>(device?.neutralZoom ?? 1);

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  const format = useCameraFormat(device, [
    { photoAspectRatio: 16 / 9 },
    { photoResolution: 'max' },
    { videoResolution: 'max' },
  ]);

  const zoomStops = useMemo(() => {
    if (!device) return [{ label: '1x', value: 1 }];
    const neutral = device.neutralZoom;
    const stops: { label: string; value: number }[] = [];

    // 0.5x
    if (device.minZoom < neutral) {
      const ratio = device.minZoom / neutral;
      stops.push({
        label: `${parseFloat(ratio.toFixed(1))}x`,
        value: device.minZoom,
      });
    }

    // 1x
    stops.push({ label: '1x', value: neutral });

    // 2x
    if (device.maxZoom >= neutral * 2) {
      stops.push({ label: '2x', value: neutral * 2 });
    }
    return stops;
  }, [device]);

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePhoto();
      setCapturedAsset({
        uri: `file://${photo.path}`,
        type: 'image',
        width: photo.width,
        height: photo.height,
      });
    } catch {
      Burnt.toast({
        title: 'Failed to take photo',
        preset: 'error',
        haptic: 'error',
      });
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecordingRef.current) return;
    isRecordingRef.current = true;
    setIsRecording(true);

    cameraRef.current.startRecording({
      onRecordingFinished: (video) => {
        isRecordingRef.current = false;
        setIsRecording(false);
        setCapturedAsset({
          uri: `file://${video.path}`,
          type: 'video',
          width: video.width,
          height: video.height,
          duration: video.duration,
        });
      },
      onRecordingError: () => {
        isRecordingRef.current = false;
        setIsRecording(false);
        Burnt.toast({
          title: 'Recording failed',
          preset: 'error',
          haptic: 'error',
        });
      },
    });
  }, []);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecordingRef.current) return;
    await cameraRef.current.stopRecording();
  }, []);

  const toggleCameraPosition = useCallback(() => {
    setCameraPosition((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  const reset = useCallback(() => {
    setCapturedAsset(null);
    setZoom(device?.neutralZoom ?? 1);
    setCaptureMode('photo');
    setIsRecording(false);
  }, [device]);

  useEffect(() => {
    if (device) setZoom(device.neutralZoom);
  }, [device]);

  return {
    cameraRef,
    device,
    cameraPosition,
    toggleCameraPosition,
    captureMode,
    setCaptureMode,
    zoom,
    setZoom,
    zoomStops,
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
    reset,
  };
}
