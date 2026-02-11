import { View, Text } from 'react-native';
import Modal from './Modal';

export type UploadProgress = {
  total: number;
  completed: number;
  failed: number;
};

type Props = {
  visible: boolean;
  progress: UploadProgress | null;
};

export default function UploadProgressModal({ visible, progress }: Props) {
  if (!progress) return null;

  const percentage = Math.round((progress.completed / progress.total) * 100);

  return (
    <Modal
      visible={visible}
      onClose={() => {}}
      disableBackdropDismiss
      contentClassName="w-[75%] p-6"
    >
      <View className="items-center">
        {/* Title */}
        <Text className="text-lg font-semibold text-slate-800 mb-1">
          Uploading Media
        </Text>

        {/* Count */}
        <Text className="text-sm text-slate-500 mb-4">
          {progress.completed} of {progress.total}
        </Text>

        {/* Progress bar background */}
        <View className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          {/* Progress bar fill */}
          <View
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>

        {/* Failed indicator (if any) */}
        {progress.failed > 0 && (
          <Text className="text-xs text-red-500 mt-2">
            {progress.failed} failed
          </Text>
        )}
      </View>
    </Modal>
  );
}
