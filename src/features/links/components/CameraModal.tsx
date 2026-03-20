import * as ImagePicker from 'expo-image-picker';
import { useVisionCamera } from '../hooks/useVisionCamera';
import { useEffect } from 'react';
import { Modal, View, Text, StatusBar } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Button } from '../../../components';
import { CameraView } from './CameraView';
import { CameraPreview } from './CameraPreview';

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
  const camera = useVisionCamera();

  useEffect(() => {
    if (!visible) return;
    if (!camera.hasCameraPermission) camera.requestCameraPermission();
    if (!camera.hasMicrophonePermission) camera.requestMicrophonePermission();
  }, [
    visible,
    camera.hasCameraPermission,
    camera.hasMicrophonePermission,
    camera.requestCameraPermission,
    camera.requestMicrophonePermission,
  ]);

  useEffect(() => {
    if (!visible) return;
    camera.setCaptureMode(initialMode);
  }, [visible, initialMode, camera.setCaptureMode]);

  const handleConfirm = () => {
    if (!camera.capturedAsset) return;
    onCapture([
      {
        uri: camera.capturedAsset.uri,
        type: camera.capturedAsset.type,
        width: camera.capturedAsset.width ?? 0,
        height: camera.capturedAsset.height ?? 0,
        duration: camera.capturedAsset.duration,
        assetId: null,
        fileName: null,
        fileSize: null,
        mimeType:
          camera.capturedAsset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        base64: null,
        exif: null,
      },
    ]);
    camera.reset();
    onClose();
  };

  const handleClose = () => {
    camera.reset();
    onClose();
  };

  if (!camera.hasCameraPermission || !camera.hasMicrophonePermission) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.centered}>
          <Text style={styles.permText}>Camera permissions required</Text>
          <Button
            onPress={() => {
              camera.requestCameraPermission();
              camera.requestMicrophonePermission();
            }}
            title="Grant"
          />
        </View>
      </Modal>
    );
  }

  if (!camera.device) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.centered}>
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
        {!camera.capturedAsset ? (
          <CameraView camera={camera} onClose={handleClose} />
        ) : (
          <CameraPreview
            asset={camera.capturedAsset}
            onDiscard={() => camera.setCapturedAsset(null)}
            onConfirm={handleConfirm}
          />
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
  centered: {
    flex: 1,
    backgroundColor: theme.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.base,
  },
}));
