import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Modal, TextField } from '../../../components';

type Props = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export default function CreateLinkModal({
  visible,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLocalLoading(true);
    try {
      await onSubmit(name.trim());
      setName('');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose} animationType="slide">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Start a Link</Text>
        <Pressable onPress={handleClose} className="p-2">
          <Text className="text-neutral-500">Close</Text>
        </Pressable>
      </View>

      <Text className="text-sm text-slate-500 mb-4">
        A Link is a shared space for capturing memories during a hangout or
        event.
      </Text>

      <TextField
        header="Link Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Beach Day, Birthday Party"
        autoCapitalize="words"
        maxLength={50}
        returnKeyType="done"
      />

      <View className="mt-6">
        <Button
          title="Start Link"
          size="lg"
          onPress={handleSubmit}
          loading={loading || localLoading}
          disabled={!name.trim()}
        />
      </View>
    </Modal>
  );
}
