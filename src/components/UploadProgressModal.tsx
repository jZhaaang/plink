import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text, Modal } from './';

export interface UploadProgress {
  total: number;
  completed: number;
  failed: number;
}

interface UploadProgressModalProps {
  visible: boolean;
  progress: UploadProgress | null;
}

export default function UploadProgressModal({
  visible,
  progress,
}: UploadProgressModalProps) {
  if (!progress) return null;

  const percentage = Math.round((progress.completed / progress.total) * 100);

  return (
    <Modal
      visible={visible}
      onClose={() => {}}
      disableBackdropDismiss
      contentStyle={styles.modalContent}
    >
      <View style={styles.body}>
        <Text variant="headingMd" color="primary">
          Uploading Media
        </Text>
        <Text variant="bodyMd" color="tertiary">
          {progress.completed} of {progress.total}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>

        {progress.failed > 0 && (
          <Text variant="bodySm" color="error">
            {progress.failed} failed
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  modalContent: {
    width: '75%',
    padding: theme.spacing['2xl'],
  },
  body: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
  },
}));
