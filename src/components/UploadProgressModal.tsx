import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Modal from './Modal';

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
        <Text style={styles.title}>Uploading Media</Text>
        <Text style={styles.count}>
          {progress.completed} of {progress.total}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>

        {progress.failed > 0 && (
          <Text style={styles.failedText}>{progress.failed} failed</Text>
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
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  count: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.lg,
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
  failedText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
}));
