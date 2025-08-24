import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

export function ConfirmModal({
  visible,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="w-full max-w-md bg-white rounded-2xl p-6">
          <Text className="text-lg font-semibold mb-2">{title}</Text>
          <Text className="text-gray-700 mb-4">{message}</Text>
          <View className="flex-row justify-end space-x-3">
            <Pressable onPress={onCancel}>
              <Text className="text-gray-600">{cancelText}</Text>
            </Pressable>
            <Pressable onPress={onConfirm}>
              <Text className="text-red-600 font-medium">{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
