import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Modal, ModalHeader, TextField } from '../../../components';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export default function CreateLinkModal({
  visible,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName('');
  }, [visible]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onSubmit(name.trim());
    setName('');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      animationType="fade"
      disableBackdropDismiss={loading}
      scrollEnabled={false}
    >
      <ModalHeader title={'Start a Link'} onClose={onClose} />

      <TextField
        header="Link Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter a link name"
        autoCapitalize="words"
        maxLength={30}
        returnKeyType="done"
      />

      <View style={styles.submitWrap}>
        <Button
          title={'Start Link'}
          size="md"
          onPress={handleSubmit}
          loading={loading}
          disabled={!name.trim()}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  submitWrap: {
    marginTop: theme.spacing['2xl'],
  },
}));
